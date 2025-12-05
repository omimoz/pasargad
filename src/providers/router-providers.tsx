import { RouterProvider } from "react-router-dom"
import Router from "../pages/layout"

const RouterProviders = () => {
    return (
        <RouterProvider router={Router} />
    )
}

export default RouterProviders