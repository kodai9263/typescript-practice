import { FieldError, UseFormRegister, Path } from "react-hook-form";
import classes from "./Input.module.css"
import { ContactForm } from "./Form";

export type InputProps = {
  id: Path<ContactForm>;
  label: string;
  type: string;
  register: UseFormRegister<ContactForm>;
  disabled?: boolean;
  error?: FieldError;
};

export const Input: React.FC<InputProps> = (props) => {
  return(
    <div className={classes.formContainer}>
      <label htmlFor={props.id} className={classes.label}>{props.label}</label>
      <div className={classes.inputContainer}>
        <input id={props.id} type={props.type}
          {...props.register(props.id)} disabled={props.disabled} className={classes.input} />
        {props.error && <div className={classes.errorMessage}>{props.error.message}</div>}
      </div>
    </div>
  );
}