import classes from "./Form.module.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"
import { Input } from "./Input";
import { Textarea } from "./Textarea";

export type ContactForm = {
  name: string;
  email: string;
  context: string;
}

const schema: yup.ObjectSchema<ContactForm> = yup.object({
  name: yup
    .string()
    .required("お名前は必須です。")
    .max(30, "お名前は30文字以内で入力してください。"),
  email: yup
    .string()
    .required("メールアドレスは必須です。")
    .email("有効なメールアドレスを入力してください。"),
  context: yup
    .string()
    .required("本文は必須です。")
    .max(500, "本文は500文字以内で入力してください。")
});

export const Form: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch("https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/contacts",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, context: data.context })
      });
      if (!res.ok) {
        throw new Error("送信できませんでした。");
      }
      alert("送信しました");
      reset();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const handleClear = () => reset();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>問合せフォーム</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input id="name" type="text" label="お名前" register={register} error={errors.name} disabled={isSubmitting} />
        <Input id="email" type="text" label="メールアドレス" register={register} error={errors.email} disabled={isSubmitting} />
        <Textarea id="context" type="text" rows="8" register={register} error={errors.context} disabled={isSubmitting} />
        <div className={classes.buttonContainer}>
          <button type="submit" disabled={isSubmitting} className={classes.submitButton}>送信</button>
          <button type="button" disabled={isSubmitting} onClick={handleClear} className={classes.clearButton}>クリア</button>
        </div>
      </form>
    </div>
  );
}