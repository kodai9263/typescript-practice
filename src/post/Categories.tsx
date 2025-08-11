import classes from './Categories.module.css';

export type Category = {
  name: string;
  index: number;
};

type CategoriesProps = {
  categories: Category[]
};

export const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  
  return (
    <div className={classes.categoryContainer}>
      {categories.map((category, index) => (
      <p key={index} className={classes.categoryTag}>{category.name}</p>
      ))}
    </div>
  );
}