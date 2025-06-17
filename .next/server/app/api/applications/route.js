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
exports.id = "app/api/applications/route";
exports.ids = ["app/api/applications/route"];
exports.modules = {

/***/ "(rsc)/./app/api/applications/route.ts":
/*!***************************************!*\
  !*** ./app/api/applications/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Environment variable z fallback dla local development\nconst DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110';\nasync function GET() {\n    try {\n        console.log('[API Applications] Pobieranie aplikacji z Data Provider API...');\n        // Połącz się z Data Provider API\n        const response = await fetch(`${DATA_PROVIDER_API_URL}/api/applications`, {\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n        if (!response.ok) {\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        const data = await response.json();\n        console.log('[API Applications] Pobrano dane:', data);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (error) {\n        console.error('[API Applications] Błąd pobierania aplikacji:', error);\n        // Fallback do mockowanych danych w przypadku błędu\n        const fallbackApplications = {\n            database_applications: [\n                {\n                    app_id: \"ebiuro\",\n                    app_name: \"eBiuro\",\n                    description: \"System zarządzania biurem\",\n                    profiles: [\n                        {\n                            profile_id: \"admin\",\n                            profile_name: \"Administrator\",\n                            description: \"Pełny dostęp\",\n                            is_default: false\n                        }\n                    ],\n                    status: \"active\"\n                }\n            ]\n        };\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            ...fallbackApplications,\n            error: 'Używam danych fallback z powodu błędu API'\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FwcGxpY2F0aW9ucy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7OztBQUEwQztBQUUxQyx3REFBd0Q7QUFDeEQsTUFBTUMsd0JBQXdCQyxRQUFRQyxHQUFHLENBQUNGLHFCQUFxQixJQUFJO0FBRTVELGVBQWVHO0lBQ3BCLElBQUk7UUFDRkMsUUFBUUMsR0FBRyxDQUFDO1FBRVosaUNBQWlDO1FBQ2pDLE1BQU1DLFdBQVcsTUFBTUMsTUFBTSxHQUFHUCxzQkFBc0IsaUJBQWlCLENBQUMsRUFBRTtZQUN4RVEsU0FBUztnQkFDUCxnQkFBZ0I7WUFDbEI7UUFDRjtRQUVBLElBQUksQ0FBQ0YsU0FBU0csRUFBRSxFQUFFO1lBQ2hCLE1BQU0sSUFBSUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFSixTQUFTSyxNQUFNLEVBQUU7UUFDMUQ7UUFFQSxNQUFNQyxPQUFPLE1BQU1OLFNBQVNPLElBQUk7UUFDaENULFFBQVFDLEdBQUcsQ0FBQyxvQ0FBb0NPO1FBRWhELE9BQU9iLHFEQUFZQSxDQUFDYyxJQUFJLENBQUNEO0lBRTNCLEVBQUUsT0FBT0UsT0FBTztRQUNkVixRQUFRVSxLQUFLLENBQUMsaURBQWlEQTtRQUUvRCxtREFBbUQ7UUFDbkQsTUFBTUMsdUJBQXVCO1lBQzNCQyx1QkFBdUI7Z0JBQ3JCO29CQUNFQyxRQUFRO29CQUNSQyxVQUFVO29CQUNWQyxhQUFhO29CQUNiQyxVQUFVO3dCQUNSOzRCQUFFQyxZQUFZOzRCQUFTQyxjQUFjOzRCQUFpQkgsYUFBYTs0QkFBZ0JJLFlBQVk7d0JBQU07cUJBQ3RHO29CQUNEWixRQUFRO2dCQUNWO2FBQ0Q7UUFDSDtRQUVBLE9BQU9aLHFEQUFZQSxDQUFDYyxJQUFJLENBQUM7WUFDdkJXLFNBQVM7WUFDVCxHQUFHVCxvQkFBb0I7WUFDdkJELE9BQU87UUFDVDtJQUNGO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qYWNrL3JlcG8vcHJvamVjdHMvb3BhX3plcm9fcG9sbC9hcHAvYXBpL2FwcGxpY2F0aW9ucy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGUgeiBmYWxsYmFjayBkbGEgbG9jYWwgZGV2ZWxvcG1lbnRcbmNvbnN0IERBVEFfUFJPVklERVJfQVBJX1VSTCA9IHByb2Nlc3MuZW52LkRBVEFfUFJPVklERVJfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MTEwJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbQVBJIEFwcGxpY2F0aW9uc10gUG9iaWVyYW5pZSBhcGxpa2FjamkgeiBEYXRhIFByb3ZpZGVyIEFQSS4uLicpXG4gICAgXG4gICAgLy8gUG/FgsSFY3ogc2nEmSB6IERhdGEgUHJvdmlkZXIgQVBJXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtEQVRBX1BST1ZJREVSX0FQSV9VUkx9L2FwaS9hcHBsaWNhdGlvbnNgLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YClcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgY29uc29sZS5sb2coJ1tBUEkgQXBwbGljYXRpb25zXSBQb2JyYW5vIGRhbmU6JywgZGF0YSlcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhKVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW0FQSSBBcHBsaWNhdGlvbnNdIELFgsSFZCBwb2JpZXJhbmlhIGFwbGlrYWNqaTonLCBlcnJvcilcbiAgICBcbiAgICAvLyBGYWxsYmFjayBkbyBtb2Nrb3dhbnljaCBkYW55Y2ggdyBwcnp5cGFka3UgYsWCxJlkdVxuICAgIGNvbnN0IGZhbGxiYWNrQXBwbGljYXRpb25zID0ge1xuICAgICAgZGF0YWJhc2VfYXBwbGljYXRpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhcHBfaWQ6IFwiZWJpdXJvXCIsXG4gICAgICAgICAgYXBwX25hbWU6IFwiZUJpdXJvXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiU3lzdGVtIHphcnrEhWR6YW5pYSBiaXVyZW1cIixcbiAgICAgICAgICBwcm9maWxlczogW1xuICAgICAgICAgICAgeyBwcm9maWxlX2lkOiBcImFkbWluXCIsIHByb2ZpbGVfbmFtZTogXCJBZG1pbmlzdHJhdG9yXCIsIGRlc2NyaXB0aW9uOiBcIlBlxYJueSBkb3N0xJlwXCIsIGlzX2RlZmF1bHQ6IGZhbHNlIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN0YXR1czogXCJhY3RpdmVcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgLi4uZmFsbGJhY2tBcHBsaWNhdGlvbnMsXG4gICAgICBlcnJvcjogJ1XFvHl3YW0gZGFueWNoIGZhbGxiYWNrIHogcG93b2R1IGLFgsSZZHUgQVBJJ1xuICAgIH0pXG4gIH1cbn0gIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIkRBVEFfUFJPVklERVJfQVBJX1VSTCIsInByb2Nlc3MiLCJlbnYiLCJHRVQiLCJjb25zb2xlIiwibG9nIiwicmVzcG9uc2UiLCJmZXRjaCIsImhlYWRlcnMiLCJvayIsIkVycm9yIiwic3RhdHVzIiwiZGF0YSIsImpzb24iLCJlcnJvciIsImZhbGxiYWNrQXBwbGljYXRpb25zIiwiZGF0YWJhc2VfYXBwbGljYXRpb25zIiwiYXBwX2lkIiwiYXBwX25hbWUiLCJkZXNjcmlwdGlvbiIsInByb2ZpbGVzIiwicHJvZmlsZV9pZCIsInByb2ZpbGVfbmFtZSIsImlzX2RlZmF1bHQiLCJzdWNjZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/applications/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fapplications%2Froute&page=%2Fapi%2Fapplications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fapplications%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fapplications%2Froute&page=%2Fapi%2Fapplications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fapplications%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_jack_repo_projects_opa_zero_poll_app_api_applications_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/applications/route.ts */ \"(rsc)/./app/api/applications/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/applications/route\",\n        pathname: \"/api/applications\",\n        filename: \"route\",\n        bundlePath: \"app/api/applications/route\"\n    },\n    resolvedPagePath: \"/Users/jack/repo/projects/opa_zero_poll/app/api/applications/route.ts\",\n    nextConfigOutput,\n    userland: _Users_jack_repo_projects_opa_zero_poll_app_api_applications_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhcHBsaWNhdGlvbnMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFwcGxpY2F0aW9ucyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFwcGxpY2F0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNxQjtBQUNsRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL2phY2svcmVwby9wcm9qZWN0cy9vcGFfemVyb19wb2xsL2FwcC9hcGkvYXBwbGljYXRpb25zL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hcHBsaWNhdGlvbnMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hcHBsaWNhdGlvbnNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FwcGxpY2F0aW9ucy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9qYWNrL3JlcG8vcHJvamVjdHMvb3BhX3plcm9fcG9sbC9hcHAvYXBpL2FwcGxpY2F0aW9ucy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fapplications%2Froute&page=%2Fapi%2Fapplications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fapplications%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fapplications%2Froute&page=%2Fapi%2Fapplications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fapplications%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();