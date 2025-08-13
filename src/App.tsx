import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { Form } from "./form/Form";
import { PostDetail } from "./components/PostDetail";

const App: React.FC = () => {
  return (
    <>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='contact' element={<Form />} />
      <Route path='/posts/:id' element={<PostDetail />} />
    </Routes>
    </>
  );
}

export default App;
