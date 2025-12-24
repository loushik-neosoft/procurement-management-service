// auto generate routes

import { readdirSync } from "fs"
import path from "path"
import { Express } from "express"

const setUpRoutes = (app: Express) => {
    const baseRoute = '/api'

    //loop through all the folders in modues that has a .route. file
    const modules = readdirSync(path.join(__dirname, 'modules'))
    modules.forEach((module) => {
        const modulePath = path.join(__dirname, 'modules', module)
        const stats = require('fs').statSync(modulePath);
        if (!stats.isDirectory()) return;

        const routeFile = readdirSync(modulePath).find((file) => /\.routes?\./.test(file))

        if (routeFile) {
            const routes = require(path.join(modulePath, routeFile))
            app.use(`${baseRoute}/${module}`, routes.default)
            console.log(`route configured: ${baseRoute}/${module}`)
        }
    })
}

export default setUpRoutes