import { Transaction } from "@mysten/sui/transactions";
//import { TransactionBlock } from '@mysten/sui.js/transactions';

import { Button, Container, Flex } from "@radix-ui/themes";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

import { toast } from "react-toastify";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";


export function CreateCounter({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();
  

  function create() {
    const tx = new Transaction();
    
    //const [coins] = tx.splitCoins(tx.gas, [100]);
    //tx.setSender();
    //tx.setGasPrice(1000);
    //tx.setGasBudgetIfNotSet(10000000);
    //tx.setGasPayment()
//useSignAndExecuteTransaction();

    tx.moveCall({
      //arguments: [/*tx.object(coins)*/],
      target: `${counterPackageId}::sui_counter::create`,
    });
    //tx.build()

    signAndExecute(
      {
        transaction: tx,
        // chain: 'sui:testnet', // allready defined in main.tsx::defaultNetwork(..)
      },
      {
        
        onError: (err) => {toast.error(err.message);},

        //onSuccess: (result) => {toast.success(`Digest: ${result.digest}`);},
        
       
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });

          toast.success(`Created object ID: ${effects?.created?.[0].reference?.objectId}`);
          //onCreated('0xa09e0483cd80e7955365cb0ea3733dd5821b7fe3ae0d66d964448d12d347978d');
          onCreated(effects?.created?.[0]?.reference?.objectId!);
        
        },
        
      },
    );
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={isSuccess || isPending}
      >
        {isSuccess || isPending ? <ClipLoader size={20} /> : "Create Counter"}
      </Button>
      <Flex>PackageID: {counterPackageId}</Flex>
    </Container>
  );
}
