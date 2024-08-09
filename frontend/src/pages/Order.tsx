import {
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { getActiveOrders, getFulfilledOrders } from "../../contracts/orderManager";
import { createClient, getTokenDetailsByAddress } from "../config/helpers";
import { getOrderManagerAddress } from "../../contracts/multiTokenKeeper";
import { baseSepolia } from "thirdweb/chains";
import {
  createMultiTokenKeeper,
  getMultiTokenKeeper,
} from "../../contracts/multiTokenKeeperFactory";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { BigNumber } from "ethers";

const Order: React.FC = () => {
  const [action, setAction] = useState<string>("pending");
  const { smartAccount } = useSelector((state: RootState) => state.wallet);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Start loading
      setError(null); // Clear previous errors

      try {
        const client = createClient();

        if (!smartAccount) return;

        let address: string = await getMultiTokenKeeper({
          ownerAddress: smartAccount?.address,
          chain: baseSepolia,
          client,
          contractAddress: "0x163818e49ccc4909ed70649806153020354b843b",
        });

        if (
          address.toLocaleLowerCase() === "0x0000000000000000000000000000000000000000".toLowerCase()
        ) {
          // Create keeper if no keeper created for user
          await createMultiTokenKeeper({
            smartAccount,
            client,
            chain: baseSepolia,
            contractAddress: "0x163818e49ccc4909ed70649806153020354b843b",
          });
        }

        address = await getMultiTokenKeeper({
          ownerAddress: smartAccount?.address,
          chain: baseSepolia,
          client,
          contractAddress: "0x163818e49ccc4909ed70649806153020354b843b",
        });

        const orderManagerAddress = await getOrderManagerAddress({
          chain: baseSepolia,
          client,
          contractAddress: address,
        });

        // Fetch orders based on action
        if (action === "pending") {
          const activeOrders = await getActiveOrders({
            chain: baseSepolia,
            client,
            contractAddress: orderManagerAddress,
          });
          setOrdersList([...activeOrders]);
        } else if (action === "completed") {
          const fulfilledOrders = await getFulfilledOrders({
            chain: baseSepolia,
            client,
            contractAddress: orderManagerAddress,
          });
          setOrdersList([...fulfilledOrders]);
        }
      } catch (err: any | unknown) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchOrders();
  }, [smartAccount, action]);

  const handleSegmentChange = (newAction: string) => {
    setAction(newAction); // Update action which triggers useEffect
  };

  const handleCancel = (orderId: string) => {
    // Implement cancel logic here

    console.log(`Cancel button clicked for order ID: ${orderId}`);
  };

  return (
    <IonContent className="ion-padding">
      <div className="mt-5 w-72 mx-auto">
        <ActionSegment action={action} onChange={handleSegmentChange} />
      </div>
      {loading ? (
        <Skeletons />
      ) : error ? (
        <div className="ion-padding">Error: {error}</div>
      ) : (
        <IonGrid className="h-full w-full">
          {ordersList?.map((transaction) => (
            <IonRow
              key={transaction?.id}
              className="ion-margin-top text-sm bg-background-secondary rounded-md px-4 py-6 shadow-md"
            >
              <IonGrid>
                <IonRow className="ion-align-items-center font-semibold gap-3">
                  <IonCol size="4">Token Name</IonCol>
                  <IonCol size="3">Target Price</IonCol>
                  <IonCol>Amt</IonCol>
                  <IonCol></IonCol>
                </IonRow>
                <IonRow className="ion-align-items-center mt-2 gap-3">
                  <IonCol size="4" className="flex gap-1 items-center">
                    <IonImg
                      className="w-5 h-5 -ml-1 rounded-full overflow-hidden"
                      src={getTokenDetailsByAddress(transaction?.token)?.logoURI}
                    />
                    {getTokenDetailsByAddress(transaction?.token)?.name}
                  </IonCol>
                  <IonCol size="3">${transaction?.targetPrice}</IonCol>
                  <IonCol>
                    $
                    {BigNumber.from(transaction?.amount)
                      .div(BigNumber.from("1000000000000000000"))
                      .toString()}
                  </IonCol>
                  <IonCol>
                    {action === "pending" && (
                      <IonChip
                        onClick={() => handleCancel(transaction?.id)}
                        className="text-xs -mt-8 mb-2 justify-center bg-red-500 text-center flex"
                      >
                        <IonText className="text-center">Cancel</IonText>
                      </IonChip>
                    )}
                    <IonChip
                      color={transaction?.orderType === 0 ? "success" : "danger"}
                      className="text-xs justify-center text-center flex"
                    >
                      <IonText className="text-center">
                        {transaction?.orderType === 0 ? "Buy" : "Sell"}
                      </IonText>
                    </IonChip>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonRow>
          ))}
        </IonGrid>
      )}
    </IonContent>
  );
};

export default Order;

interface ActionSegmentProps {
  action: string;
  onChange: (action: string) => void;
}

const ActionSegment: React.FC<ActionSegmentProps> = ({ action, onChange }) => (
  <IonSegment mode="ios" value={action} onIonChange={(e) => onChange(e.detail.value as string)}>
    <IonSegmentButton value="pending" className="p-2 font-medium text-lg">
      In-Order
    </IonSegmentButton>
    <IonSegmentButton value="completed" className="p-2 font-medium text-lg">
      Completed
    </IonSegmentButton>
  </IonSegment>
);

const Skeletons = () => {
  return (
    <>
      {Array(10)
        .fill(10)
        .map((_, index) => (
          <IonRow
            key={index}
            className="ion-margin-top w-full animate-pulse h-28 bg-background-secondary rounded-md"
          ></IonRow>
        ))}
    </>
  );
};