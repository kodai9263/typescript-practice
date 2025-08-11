import { number, string } from "yup";

type FormatDateProps = {
  date: string | number;
};

export const FormatDate: React.FC<FormatDateProps> = ({ date }) => {

  const format = (date: string | number) => new Date(date).toLocaleDateString();

  return (
    <p>{format(date)}</p>
  );
}