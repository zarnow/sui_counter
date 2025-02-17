import { Transaction } from "@mysten/sui/transactions";
//import { TransactionBlock } from '@mysten/sui.js/transactions';

import { Button, Container, Flex, Box, Text, TextField } from "@radix-ui/themes";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

import { toast } from "react-toastify";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from 'react';

export function CreateCounter({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  //const htmlAttributes = { maxLength: '20' };
  const [suiInMIST, setHowMuchSui] = useState(0);
  const [lockForMillis, setLockFor] = useState(0);

  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();
  

  function create() {
    const tx = new Transaction();
    
    const [suiCoinsToLock] = tx.splitCoins(tx.gas, [BigInt(suiInMIST),]);
    
    tx.moveCall({
      arguments: [suiCoinsToLock, tx.object('0x6'), tx.pure.u64(BigInt(lockForMillis))], //timer 0x6 initialization
      target: `${counterPackageId}::sui_counter::create_locker`,
    });
  

    signAndExecute(
      {
        transaction: tx,
        // chain: 'sui:testnet', // allready defined in main.tsx::defaultNetwork(..)
      },
      {
        
        onError: (err) => {
          toast.error(err.message);
          // need ulock UI
        },

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
          <Box mb="3">
          <Text>How many SUI?</Text>
          <TextField.Root
            placeholder="in SUI float"
            type="number"
            required
            onChange={(e) => {
              var value = 0;
              if(e.target.value.length) value = parseFloat(e.target.value) * 1000000000;
              
              setHowMuchSui(value);
              //setHouseStake(Number(e.target.value));
            }}
          />
        </Box>

        <Box mb="3">
          <Text>For how long?</Text>
          <TextField.Root
          
            placeholder="Time in milliseconds..."
            type="number"
            required
            onChange={(f) => {
              var value = '0';
              if(f.target.value.length) value = Math.max(0, parseInt(f.target.value) ).toString().slice(0,13);
              setLockFor(Number(value));
            }}
          />
        </Box>


       <Box mb="4">
              <Text as="div">Cohones lock SUI: </Text>
              <Text as="div">{(suiInMIST * 0.000000001).toString() }</Text>
              <Text as="div">In MIST: </Text>
              <Text as="div">{suiInMIST} </Text>
              <Text as="div">Milliseconds lock: </Text>
              <Text as="div">{lockForMillis}</Text>
              <Text as="div">Minutes lock: </Text>
              <Text as="div">{lockForMillis * 1.0 / 1000 / 60}</Text>
              <Text as="div">Unlock time: </Text>
              <Text as="div">{Intl.DateTimeFormat('pl-PL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(Date.now() + Number(lockForMillis))} </Text>
            </Box>
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={isSuccess || isPending}
      >
        {isSuccess || isPending ? <ClipLoader size={20} /> : "Create Cojones Vault"}
      </Button>
      <Flex>PackageID: {counterPackageId}</Flex>
    </Container>

    
  );

  
}



