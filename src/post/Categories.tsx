import classes from './Categories.module.css';

export type Category = {
  name: string;
  index: number;
};

type CategoriesProps = {
  categories: string[]
};

export const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  return (
    <div className={classes.categoryContainer}>
      {categories.map((category, index) => (
        <p key={index} className={classes.categoryTag}>{category}</p>
      ))}
    </div>
  );
}