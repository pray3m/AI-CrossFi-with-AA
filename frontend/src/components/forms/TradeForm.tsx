import {
  IonButton,
  IonCol,
  IonContent,
  IonInput,
  IonItem,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import React, { useState } from "react";
import { getTokenOptions } from "../../config/helpers";

const TradeForm: React.FC = () => {
  const [tokenName, setTokenName] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<string>("");
  const [action, setAction] = useState<string>("buy");

  const handleAction = () => {
    if (action === "buy") {
      console.log(`Buy: ${tokenName} @ ${targetPrice} -> ${amountUSD}`);
    } else {
      console.log(`Sell: ${tokenName} @ ${targetPrice} -> ${amountUSD}`);
    }
  };

  return (
    <IonContent>
      <IonSegment
        value={action}
        onIonChange={(e) => {
          const selectedAction = e.detail.value as string | undefined;
          if (selectedAction) {
            setAction(selectedAction);
          }
        }}
        className="ion-margin-top"
      >
        <IonSegmentButton value="buy">Buy</IonSegmentButton>
        <IonSegmentButton value="sell">Sell</IonSegmentButton>
      </IonSegment>

      <div className="ion-padding ion-margin-top b" color="primary">
        <IonItem className="ion-margin ">
          <IonSelect
            label="Token"
            interface="popover"
            placeholder="Select"
            value={tokenName}
            onIonChange={(e) => setTokenName(e.detail.value!)}
          >
            {getTokenOptions().map((option) => (
              <IonSelectOption key={option.value} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        {action === "buy" && (
          <>
            <IonItem className="ion-margin">
              <IonInput
                onIonChange={(e) => setTargetPrice(e.detail.value!)}
                label="Price"
                labelPlacement="floating"
                placeholder="Enter target price"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-margin">
              <IonInput
                label="Amount"
                labelPlacement="floating"
                placeholder="Enter amount in USD"
                onIonChange={(e) => setAmountUSD(e.detail.value!)}
              ></IonInput>
            </IonItem>
          </>
        )}

        {action === "sell" && (
          <>
            <IonItem className="ion-margin">
              <IonInput
                onIonChange={(e) => setTargetPrice(e.detail.value!)}
                label="Sell Price"
                labelPlacement="floating"
                placeholder="Enter sell price"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-margin">
              <IonInput
                label="Amount"
                labelPlacement="floating"
                placeholder="Enter amount to sell in USD"
                onIonChange={(e) => setAmountUSD(e.detail.value!)}
              ></IonInput>
            </IonItem>
          </>
        )}
      </div>

      <IonRow className="ion-margin">
        <IonCol>
          <IonButton
            onClick={handleAction}
            className="ion-margin"
            expand="block"
            color={action === "buy" ? "success" : "danger"}
          >
            {action === "buy" ? "Buy" : "Sell"}
          </IonButton>
        </IonCol>
      </IonRow>
    </IonContent>
  );
};

export default TradeForm;
