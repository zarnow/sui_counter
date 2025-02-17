import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";



import type { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";


export function Counter({ id }: { id: string }) {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  const [waitingForTxn, setWaitingForTxn] = useState("");

  const executeMoveCall = (method: "increment" | "reset") => {
    setWaitingForTxn(method);

    const tx = new Transaction();
    //tx.setGasBudgetIfNotSet(10000000);

    if (method === "reset") {
      tx.moveCall({
        arguments: [tx.object(id), tx.object('0x6')],
        target: `${counterPackageId}::sui_counter::withdraw_all`,
      });
    } else {
      const coin = tx.splitCoins(tx.gas, [1000000]);
      tx.moveCall({
        //arguments: [tx.object(id), tx.object('0x6')], //timer 0x6 initialization
        //target: `${counterPackageId}::sui_counter::increment`,
        arguments: [coin, tx.object(id)], //timer 0x6 initialization
        target: `${counterPackageId}::sui_counter::deposit`,
      });
    }

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          toast.error(err.message);
          setWaitingForTxn("");

        },
        onSuccess: (tx) => {
          suiClient.waitForTransaction({ digest: tx.digest }).then(async () => {
            await refetch();
            setWaitingForTxn("");
            toast.success(`Success: ${tx.digest}`);
          });
        },
      },
    );
  };

  if (isPending) return <Text>Loading...</Text>;

  if (error) return <Text>Error: {error.message}</Text>;

  if (!data.data) return <Text>Not found</Text>;

  const ownedByCurrentAccount = getCounterFields(data.data)?.owner === currentAccount?.address;
  const timestamp_now =  Date.now();//getCounterFields(data.data)?.timestamp;
  const timestamp_unlock = getCounterFields(data.data)?.lock_till_timestamp;
  const balance = getCounterFields(data.data)?.balance.toString();
  const date_now = new Intl.DateTimeFormat('pl-PL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(Number(timestamp_now));
  const date_unlock = new Intl.DateTimeFormat('pl-PL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(Number(timestamp_unlock));
  
  return (
    <>
      <Heading size="3">Locker object id: {id}</Heading>

      <Flex direction="column" gap="2">
        
        <Text>Balance: {parseFloat(balance ? balance : '0') * 0.000000001} SUI</Text>
        <Text>Native Balance: { getCounterFields(data.data)?.native_balance} MIST</Text>
        <Text>Date now: {date_now}.{timestamp_now?.toString().slice(-3)}</Text>
        <Text>Unlock Date: {date_unlock}.{timestamp_unlock?.toString().slice(-3)}</Text>
        <Flex direction="row" gap="2">
          <Button
            onClick={() => executeMoveCall("increment")}
            disabled={waitingForTxn !== ""}
          >
            {waitingForTxn === "increment" ? (
              <ClipLoader size={20} />
            ) : (
              "Deposit 0.001 more SUI"
            )}
          </Button>
          {ownedByCurrentAccount ? (
            <Button
              onClick={() => executeMoveCall("reset")}
              disabled={waitingForTxn !== ""}
            >
              {waitingForTxn === "reset" ? <ClipLoader size={20} /> : "Withdraw all funds"}
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </>
  );
}
function getCounterFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }

  return data.content.fields as { lock_till_timestamp:string; balance: string; owner: string; native_balance: string };
}
