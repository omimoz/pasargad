import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout as AntLayout } from 'antd';
import Home from "./Home";
import { style } from "./style";
import SingleWorkItem from "./[workId]";

const { Content } = AntLayout;
const Layout = () => {
    return (
        <AntLayout className={style}>
            <Content  className="content" >
                <Outlet />
            </Content>
        </AntLayout>
    );
};
const Router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/:workId", element: <SingleWorkItem /> },
            { path: "*", element: <Navigate to="/" /> },
        ],
    },
]);
export default Router;
