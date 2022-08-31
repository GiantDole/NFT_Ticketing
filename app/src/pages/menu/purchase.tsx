import { useState } from "react";
import Head from "next/head";

import styles from "../../styles/styles.module.scss";
import FormCard from "../components/FormCard";
import {
  BillingInfo,
  ConfirmPurchase,
  TicketAmount,
} from "../components/Forms";
import FormCompleted from "../components/FormCompleted";
import FormProvider from "../context";

const Purchase = () => {
  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);

  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  return <FormProvider>
    
    <div className={styles.container}>
      <Head>
        <title>NFT Ticketing</title>
      </Head>
      <h1>Purchase Ticket</h1>

      <FormCard currentStep={formStep} prevFormStep={prevFormStep}>
        {formStep >= 0 && (
          <TicketAmount formStep={formStep} nextFormStep={nextFormStep} />
        )}
        {formStep >= 1 && (
          <BillingInfo formStep={formStep} nextFormStep={nextFormStep} />
        )}
        {formStep >= 2 && (
          <ConfirmPurchase formStep={formStep} nextFormStep={nextFormStep} />
        )}

        {formStep > 2 && <FormCompleted />}
      </FormCard>
    </div>
  
  </FormProvider>
  
};

export default Purchase;
