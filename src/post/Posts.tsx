import { useEffect, useState } from "react";
import { Category } from "./Categories";
import { PostsItem } from "./PostItem";

export type Post = {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  categories: Category[];
  content: string;
};

export const  Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts");
        if (!res.ok) {
          throw new Error("データが見つかりません。");
        }
        const date = await res.json();
        console.log('API Response:', date);
        console.log('Posts data:', date.posts);
        if (date.posts && date.posts.length > 0) {
          console.log('First post categories:', date.posts[0].categories);
        }
        setPosts(date.posts);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetcher();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!posts) {
    return <div>データが見つかりません。</div>
  }

  return (
    <dl>
      {posts.map((elem: Post) => 
        <PostsItem post={elem} key={elem.id} />
      )}
    </dl>
  );
}