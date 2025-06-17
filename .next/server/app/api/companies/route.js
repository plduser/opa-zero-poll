/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/companies/route";
exports.ids = ["app/api/companies/route"];
exports.modules = {

/***/ "(rsc)/./app/api/companies/route.ts":
/*!************************************!*\
  !*** ./app/api/companies/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Environment variable z fallback dla local development\nconst DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110';\nasync function GET(request) {\n    try {\n        const { searchParams } = new URL(request.url);\n        const tenant = searchParams.get('tenant');\n        let url = `${DATA_PROVIDER_API_URL}/api/companies`;\n        if (tenant) {\n            url += `?tenant=${encodeURIComponent(tenant)}`;\n        }\n        console.log(`[API Companies] Pobieranie firm: ${url}`);\n        // Połącz się z Data Provider API\n        const response = await fetch(url, {\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n        if (!response.ok) {\n            console.log(`[API Companies] Błąd ${response.status} z Data Provider API`);\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        const data = await response.json();\n        console.log(`[API Companies] Pobrano ${data.companies?.length || 0} firm`);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (error) {\n        console.error('[API Companies] Błąd pobierania firm:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Błąd pobierania firm',\n            details: error instanceof Error ? error.message : 'Unknown error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NvbXBhbmllcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUEwQztBQUUxQyx3REFBd0Q7QUFDeEQsTUFBTUMsd0JBQXdCQyxRQUFRQyxHQUFHLENBQUNGLHFCQUFxQixJQUFJO0FBRTVELGVBQWVHLElBQUlDLE9BQWdCO0lBQ3hDLElBQUk7UUFDRixNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlGLFFBQVFHLEdBQUc7UUFDNUMsTUFBTUMsU0FBU0gsYUFBYUksR0FBRyxDQUFDO1FBRWhDLElBQUlGLE1BQU0sR0FBR1Asc0JBQXNCLGNBQWMsQ0FBQztRQUNsRCxJQUFJUSxRQUFRO1lBQ1ZELE9BQU8sQ0FBQyxRQUFRLEVBQUVHLG1CQUFtQkYsU0FBUztRQUNoRDtRQUVBRyxRQUFRQyxHQUFHLENBQUMsQ0FBQyxpQ0FBaUMsRUFBRUwsS0FBSztRQUVyRCxpQ0FBaUM7UUFDakMsTUFBTU0sV0FBVyxNQUFNQyxNQUFNUCxLQUFLO1lBQ2hDUSxTQUFTO2dCQUNQLGdCQUFnQjtZQUNsQjtRQUNGO1FBRUEsSUFBSSxDQUFDRixTQUFTRyxFQUFFLEVBQUU7WUFDaEJMLFFBQVFDLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixFQUFFQyxTQUFTSSxNQUFNLENBQUMsb0JBQW9CLENBQUM7WUFDekUsTUFBTSxJQUFJQyxNQUFNLENBQUMsb0JBQW9CLEVBQUVMLFNBQVNJLE1BQU0sRUFBRTtRQUMxRDtRQUVBLE1BQU1FLE9BQU8sTUFBTU4sU0FBU08sSUFBSTtRQUNoQ1QsUUFBUUMsR0FBRyxDQUFDLENBQUMsd0JBQXdCLEVBQUVPLEtBQUtFLFNBQVMsRUFBRUMsVUFBVSxFQUFFLEtBQUssQ0FBQztRQUV6RSxPQUFPdkIscURBQVlBLENBQUNxQixJQUFJLENBQUNEO0lBRTNCLEVBQUUsT0FBT0ksT0FBTztRQUNkWixRQUFRWSxLQUFLLENBQUMseUNBQXlDQTtRQUV2RCxPQUFPeEIscURBQVlBLENBQUNxQixJQUFJLENBQ3RCO1lBQ0VHLE9BQU87WUFDUEMsU0FBU0QsaUJBQWlCTCxRQUFRSyxNQUFNRSxPQUFPLEdBQUc7UUFDcEQsR0FDQTtZQUFFUixRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL2phY2svcmVwby9wcm9qZWN0cy9vcGFfemVyb19wb2xsL2FwcC9hcGkvY29tcGFuaWVzL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuXG4vLyBFbnZpcm9ubWVudCB2YXJpYWJsZSB6IGZhbGxiYWNrIGRsYSBsb2NhbCBkZXZlbG9wbWVudFxuY29uc3QgREFUQV9QUk9WSURFUl9BUElfVVJMID0gcHJvY2Vzcy5lbnYuREFUQV9QUk9WSURFUl9BUElfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjgxMTAnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKVxuICAgIGNvbnN0IHRlbmFudCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3RlbmFudCcpXG4gICAgXG4gICAgbGV0IHVybCA9IGAke0RBVEFfUFJPVklERVJfQVBJX1VSTH0vYXBpL2NvbXBhbmllc2BcbiAgICBpZiAodGVuYW50KSB7XG4gICAgICB1cmwgKz0gYD90ZW5hbnQ9JHtlbmNvZGVVUklDb21wb25lbnQodGVuYW50KX1gXG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGBbQVBJIENvbXBhbmllc10gUG9iaWVyYW5pZSBmaXJtOiAke3VybH1gKVxuICAgIFxuICAgIC8vIFBvxYLEhWN6IHNpxJkgeiBEYXRhIFByb3ZpZGVyIEFQSVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW0FQSSBDb21wYW5pZXNdIELFgsSFZCAke3Jlc3BvbnNlLnN0YXR1c30geiBEYXRhIFByb3ZpZGVyIEFQSWApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YClcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgY29uc29sZS5sb2coYFtBUEkgQ29tcGFuaWVzXSBQb2JyYW5vICR7ZGF0YS5jb21wYW5pZXM/Lmxlbmd0aCB8fCAwfSBmaXJtYClcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhKVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW0FQSSBDb21wYW5pZXNdIELFgsSFZCBwb2JpZXJhbmlhIGZpcm06JywgZXJyb3IpXG4gICAgXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBcbiAgICAgICAgZXJyb3I6ICdCxYLEhWQgcG9iaWVyYW5pYSBmaXJtJyxcbiAgICAgICAgZGV0YWlsczogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcidcbiAgICAgIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIkRBVEFfUFJPVklERVJfQVBJX1VSTCIsInByb2Nlc3MiLCJlbnYiLCJHRVQiLCJyZXF1ZXN0Iiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwidGVuYW50IiwiZ2V0IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29uc29sZSIsImxvZyIsInJlc3BvbnNlIiwiZmV0Y2giLCJoZWFkZXJzIiwib2siLCJzdGF0dXMiLCJFcnJvciIsImRhdGEiLCJqc29uIiwiY29tcGFuaWVzIiwibGVuZ3RoIiwiZXJyb3IiLCJkZXRhaWxzIiwibWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/companies/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompanies%2Froute&page=%2Fapi%2Fcompanies%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompanies%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompanies%2Froute&page=%2Fapi%2Fcompanies%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompanies%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_jack_repo_projects_opa_zero_poll_app_api_companies_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/companies/route.ts */ \"(rsc)/./app/api/companies/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/companies/route\",\n        pathname: \"/api/companies\",\n        filename: \"route\",\n        bundlePath: \"app/api/companies/route\"\n    },\n    resolvedPagePath: \"/Users/jack/repo/projects/opa_zero_poll/app/api/companies/route.ts\",\n    nextConfigOutput,\n    userland: _Users_jack_repo_projects_opa_zero_poll_app_api_companies_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjb21wYW5pZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmNvbXBhbmllcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNvbXBhbmllcyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNrQjtBQUMvRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL2phY2svcmVwby9wcm9qZWN0cy9vcGFfemVyb19wb2xsL2FwcC9hcGkvY29tcGFuaWVzL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jb21wYW5pZXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jb21wYW5pZXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NvbXBhbmllcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9qYWNrL3JlcG8vcHJvamVjdHMvb3BhX3plcm9fcG9sbC9hcHAvYXBpL2NvbXBhbmllcy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompanies%2Froute&page=%2Fapi%2Fcompanies%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompanies%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcompanies%2Froute&page=%2Fapi%2Fcompanies%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcompanies%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();