import { Link } from "react-router-dom";
import classes from "./Header.module.css";

export const Header: React.FC = () => {
  return (
    <header className={classes.header}>
      <Link to="/" className={classes.headerLink}>Blog</Link>
      <Link to="/contact" className={classes.headerLink}>お問い合わせ</Link>
    </header>
  );
}