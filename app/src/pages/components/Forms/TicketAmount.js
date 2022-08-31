import { useRef } from "react";
import styles from "../../../styles/styles.module.scss";
import { Form } from "@unform/web";
import Input from "../Input Fields/Input";
import { useFormData } from "../../context";
import * as yup from "yup";


// TODO doesnt submit value of tickets 

const schema = yup.object().shape({
  ticketAmount: yup.string(),
});

export default function TicketAmount({ formStep, nextFormStep }) {

  const { setFormValues } = useFormData();
  const formRef = useRef();

  async function handleSubmit(data) {
    try {
      // formRef.current.setErrors({});
      console.log(data)
      

      await schema.validate(data, {
        abortEarly: false,
      });
      // // Validation passed - do something with data
      setFormValues(data);
      nextFormStep();
    } catch (err) {
      const errors = {};
      // Validation failed - do show error
      if (err instanceof yup.ValidationError) {
        console.log(err.inner);
        // Validation failed - do show error
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        formRef.current.setErrors(errors);
      }
    }
  }

  return (
    <div className={formStep === 0 ? styles.showForm : styles.hideForm}>
      <h2>Chose Tickets</h2>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
        <label htmlFor="ticket">Regular Ticket</label>
  <select name="ticket" type="ticketAmount" id="regularTicket">
    <option key="0" value="0">0</option>
    <option key="1" value="1">1</option>
    <option key="2" value="2">2</option>
    <option key="3" value="3">3</option>
  </select>
        </div>
        <button type="submit">Next</button>
      </Form>
    </div>
  );
}
