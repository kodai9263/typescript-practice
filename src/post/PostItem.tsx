import { Link } from 'react-router-dom';
import classes from './PostItem.module.css';
import { Post } from './Posts';
import { FormatDate } from './FormatDate';
import { Categories } from './Categories';

export const PostsItem: React.FC<{post: Post}> = ({ post }) => {

  return (
    <>
      <Link to={`/posts/${post.id}`} className={classes.link}>
        <div className={classes.container}>
        <header className={classes.postHeader}>
          <FormatDate date={post.createdAt} />
          <Categories categories={post.categories} />
        </header>
        <h1 className={classes.postTitle}>APIで取得した{post.title}</h1>
        <div className={classes.postContent} dangerouslySetInnerHTML={{ __html: post.content }}></div>
        </div>
      </Link>
    </>
  );
}