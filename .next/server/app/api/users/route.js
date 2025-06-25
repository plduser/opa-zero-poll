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
exports.id = "app/api/users/route";
exports.ids = ["app/api/users/route"];
exports.modules = {

/***/ "(rsc)/./app/api/users/route.ts":
/*!********************************!*\
  !*** ./app/api/users/route.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// Environment variable z fallback dla local development\nconst DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110';\nasync function GET() {\n    try {\n        console.log('[API Users] Pobieranie użytkowników z Data Provider API...');\n        // Połącz się z Data Provider API\n        const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/for-portal`, {\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        });\n        if (!response.ok) {\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        const data = await response.json();\n        console.log('[API Users] Pobrano dane:', data);\n        // Przetwórz dane na format używany przez frontend\n        const users = data.users?.map((user)=>({\n                id: user.id || user.user_id,\n                username: user.username || user.user_id,\n                name: user.full_name || user.name || 'Nieznany użytkownik',\n                email: user.email || '',\n                initials: user.initials || (user.full_name ? user.full_name.split(' ').map((n)=>n[0]).join('').toUpperCase() : 'NU'),\n                role: user.role || 'użytkownik',\n                tenants: user.tenants || [],\n                status: user.status || 'active'\n            })).filter((user)=>user.status === 'active') || [];\n        console.log('[API Users] Przetworzeni użytkownicy:', users);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            users,\n            count: users.length\n        });\n    } catch (error) {\n        console.error('[API Users] Błąd pobierania użytkowników:', error);\n        // Fallback do mockowanych danych w przypadku błędu\n        const fallbackUsers = [\n            {\n                id: \"user123\",\n                username: \"admin_user\",\n                name: \"Jan Kowalski\",\n                email: \"jan.kowalski@firmowa.pl\",\n                initials: \"JK\",\n                role: \"ksiegowa\",\n                status: \"active\"\n            },\n            {\n                id: \"user456\",\n                username: \"hr_manager\",\n                name: \"Anna Nowak\",\n                email: \"anna.nowak@firmowa.pl\",\n                initials: \"AN\",\n                role: \"handlowiec\",\n                status: \"active\"\n            },\n            {\n                id: \"user789\",\n                username: \"sales_rep\",\n                name: \"Piotr Zieliński\",\n                email: \"piotr.zielinski@firmowa.pl\",\n                initials: \"PZ\",\n                role: \"administrator\",\n                status: \"active\"\n            }\n        ];\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            users: fallbackUsers,\n            count: fallbackUsers.length,\n            error: 'Używam danych fallback z powodu błędu API'\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3VzZXJzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTBDO0FBRTFDLHdEQUF3RDtBQUN4RCxNQUFNQyx3QkFBd0JDLFFBQVFDLEdBQUcsQ0FBQ0YscUJBQXFCLElBQUk7QUFFNUQsZUFBZUc7SUFDcEIsSUFBSTtRQUNGQyxRQUFRQyxHQUFHLENBQUM7UUFFWixpQ0FBaUM7UUFDakMsTUFBTUMsV0FBVyxNQUFNQyxNQUFNLEdBQUdQLHNCQUFzQixxQkFBcUIsQ0FBQyxFQUFFO1lBQzVFUSxTQUFTO2dCQUNQLGdCQUFnQjtZQUNsQjtRQUNGO1FBRUEsSUFBSSxDQUFDRixTQUFTRyxFQUFFLEVBQUU7WUFDaEIsTUFBTSxJQUFJQyxNQUFNLENBQUMsb0JBQW9CLEVBQUVKLFNBQVNLLE1BQU0sRUFBRTtRQUMxRDtRQUVBLE1BQU1DLE9BQU8sTUFBTU4sU0FBU08sSUFBSTtRQUNoQ1QsUUFBUUMsR0FBRyxDQUFDLDZCQUE2Qk87UUFFekMsa0RBQWtEO1FBQ2xELE1BQU1FLFFBQVFGLEtBQUtFLEtBQUssRUFBRUMsSUFBSSxDQUFDQyxPQUFlO2dCQUM1Q0MsSUFBSUQsS0FBS0MsRUFBRSxJQUFJRCxLQUFLRSxPQUFPO2dCQUMzQkMsVUFBVUgsS0FBS0csUUFBUSxJQUFJSCxLQUFLRSxPQUFPO2dCQUN2Q0UsTUFBTUosS0FBS0ssU0FBUyxJQUFJTCxLQUFLSSxJQUFJLElBQUk7Z0JBQ3JDRSxPQUFPTixLQUFLTSxLQUFLLElBQUk7Z0JBQ3JCQyxVQUFVUCxLQUFLTyxRQUFRLElBQUtQLENBQUFBLEtBQUtLLFNBQVMsR0FBR0wsS0FBS0ssU0FBUyxDQUFDRyxLQUFLLENBQUMsS0FBS1QsR0FBRyxDQUFDLENBQUNVLElBQWNBLENBQUMsQ0FBQyxFQUFFLEVBQUVDLElBQUksQ0FBQyxJQUFJQyxXQUFXLEtBQUssSUFBRztnQkFDNUhDLE1BQU1aLEtBQUtZLElBQUksSUFBSTtnQkFDbkJDLFNBQVNiLEtBQUthLE9BQU8sSUFBSSxFQUFFO2dCQUMzQmxCLFFBQVFLLEtBQUtMLE1BQU0sSUFBSTtZQUN6QixJQUFJbUIsT0FBTyxDQUFDZCxPQUFjQSxLQUFLTCxNQUFNLEtBQUssYUFBYSxFQUFFO1FBR3pEUCxRQUFRQyxHQUFHLENBQUMseUNBQXlDUztRQUVyRCxPQUFPZixxREFBWUEsQ0FBQ2MsSUFBSSxDQUFDO1lBQ3ZCa0IsU0FBUztZQUNUakI7WUFDQWtCLE9BQU9sQixNQUFNbUIsTUFBTTtRQUNyQjtJQUVGLEVBQUUsT0FBT0MsT0FBTztRQUNkOUIsUUFBUThCLEtBQUssQ0FBQyw2Q0FBNkNBO1FBRTNELG1EQUFtRDtRQUNuRCxNQUFNQyxnQkFBZ0I7WUFDcEI7Z0JBQUVsQixJQUFJO2dCQUFXRSxVQUFVO2dCQUFjQyxNQUFNO2dCQUFnQkUsT0FBTztnQkFBMkJDLFVBQVU7Z0JBQU1LLE1BQU07Z0JBQVlqQixRQUFRO1lBQVM7WUFDcEo7Z0JBQUVNLElBQUk7Z0JBQVdFLFVBQVU7Z0JBQWNDLE1BQU07Z0JBQWNFLE9BQU87Z0JBQXlCQyxVQUFVO2dCQUFNSyxNQUFNO2dCQUFjakIsUUFBUTtZQUFTO1lBQ2xKO2dCQUFFTSxJQUFJO2dCQUFXRSxVQUFVO2dCQUFhQyxNQUFNO2dCQUFtQkUsT0FBTztnQkFBOEJDLFVBQVU7Z0JBQU1LLE1BQU07Z0JBQWlCakIsUUFBUTtZQUFTO1NBQy9KO1FBRUQsT0FBT1oscURBQVlBLENBQUNjLElBQUksQ0FBQztZQUN2QmtCLFNBQVM7WUFDVGpCLE9BQU9xQjtZQUNQSCxPQUFPRyxjQUFjRixNQUFNO1lBQzNCQyxPQUFPO1FBQ1Q7SUFDRjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvamFjay9yZXBvL3Byb2plY3RzL29wYV96ZXJvX3BvbGwvYXBwL2FwaS91c2Vycy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcblxuLy8gRW52aXJvbm1lbnQgdmFyaWFibGUgeiBmYWxsYmFjayBkbGEgbG9jYWwgZGV2ZWxvcG1lbnRcbmNvbnN0IERBVEFfUFJPVklERVJfQVBJX1VSTCA9IHByb2Nlc3MuZW52LkRBVEFfUFJPVklERVJfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MTEwJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdbQVBJIFVzZXJzXSBQb2JpZXJhbmllIHXFvHl0a293bmlrw7N3IHogRGF0YSBQcm92aWRlciBBUEkuLi4nKVxuICAgIFxuICAgIC8vIFBvxYLEhWN6IHNpxJkgeiBEYXRhIFByb3ZpZGVyIEFQSVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7REFUQV9QUk9WSURFUl9BUElfVVJMfS9hcGkvdXNlcnMvZm9yLXBvcnRhbGAsIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCBlcnJvciEgc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKVxuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICBjb25zb2xlLmxvZygnW0FQSSBVc2Vyc10gUG9icmFubyBkYW5lOicsIGRhdGEpXG5cbiAgICAvLyBQcnpldHfDs3J6IGRhbmUgbmEgZm9ybWF0IHXFvHl3YW55IHByemV6IGZyb250ZW5kXG4gICAgY29uc3QgdXNlcnMgPSBkYXRhLnVzZXJzPy5tYXAoKHVzZXI6IGFueSkgPT4gKHtcbiAgICAgIGlkOiB1c2VyLmlkIHx8IHVzZXIudXNlcl9pZCxcbiAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lIHx8IHVzZXIudXNlcl9pZCwgLy8gRG9kYW5vIHVzZXJuYW1lIHogQVBJXG4gICAgICBuYW1lOiB1c2VyLmZ1bGxfbmFtZSB8fCB1c2VyLm5hbWUgfHwgJ05pZXpuYW55IHXFvHl0a293bmlrJyxcbiAgICAgIGVtYWlsOiB1c2VyLmVtYWlsIHx8ICcnLFxuICAgICAgaW5pdGlhbHM6IHVzZXIuaW5pdGlhbHMgfHwgKHVzZXIuZnVsbF9uYW1lID8gdXNlci5mdWxsX25hbWUuc3BsaXQoJyAnKS5tYXAoKG46IHN0cmluZykgPT4gblswXSkuam9pbignJykudG9VcHBlckNhc2UoKSA6ICdOVScpLFxuICAgICAgcm9sZTogdXNlci5yb2xlIHx8ICd1xbx5dGtvd25paycsXG4gICAgICB0ZW5hbnRzOiB1c2VyLnRlbmFudHMgfHwgW10sXG4gICAgICBzdGF0dXM6IHVzZXIuc3RhdHVzIHx8ICdhY3RpdmUnXG4gICAgfSkpLmZpbHRlcigodXNlcjogYW55KSA9PiB1c2VyLnN0YXR1cyA9PT0gJ2FjdGl2ZScpIHx8IFtdXG5cbiAgICBcbiAgICBjb25zb2xlLmxvZygnW0FQSSBVc2Vyc10gUHJ6ZXR3b3J6ZW5pIHXFvHl0a293bmljeTonLCB1c2VycylcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgdXNlcnMsXG4gICAgICBjb3VudDogdXNlcnMubGVuZ3RoXG4gICAgfSlcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tBUEkgVXNlcnNdIELFgsSFZCBwb2JpZXJhbmlhIHXFvHl0a293bmlrw7N3OicsIGVycm9yKVxuICAgIFxuICAgIC8vIEZhbGxiYWNrIGRvIG1vY2tvd2FueWNoIGRhbnljaCB3IHByenlwYWRrdSBixYLEmWR1XG4gICAgY29uc3QgZmFsbGJhY2tVc2VycyA9IFtcbiAgICAgIHsgaWQ6IFwidXNlcjEyM1wiLCB1c2VybmFtZTogXCJhZG1pbl91c2VyXCIsIG5hbWU6IFwiSmFuIEtvd2Fsc2tpXCIsIGVtYWlsOiBcImphbi5rb3dhbHNraUBmaXJtb3dhLnBsXCIsIGluaXRpYWxzOiBcIkpLXCIsIHJvbGU6IFwia3NpZWdvd2FcIiwgc3RhdHVzOiBcImFjdGl2ZVwiIH0sXG4gICAgICB7IGlkOiBcInVzZXI0NTZcIiwgdXNlcm5hbWU6IFwiaHJfbWFuYWdlclwiLCBuYW1lOiBcIkFubmEgTm93YWtcIiwgZW1haWw6IFwiYW5uYS5ub3dha0BmaXJtb3dhLnBsXCIsIGluaXRpYWxzOiBcIkFOXCIsIHJvbGU6IFwiaGFuZGxvd2llY1wiLCBzdGF0dXM6IFwiYWN0aXZlXCIgfSxcbiAgICAgIHsgaWQ6IFwidXNlcjc4OVwiLCB1c2VybmFtZTogXCJzYWxlc19yZXBcIiwgbmFtZTogXCJQaW90ciBaaWVsacWEc2tpXCIsIGVtYWlsOiBcInBpb3RyLnppZWxpbnNraUBmaXJtb3dhLnBsXCIsIGluaXRpYWxzOiBcIlBaXCIsIHJvbGU6IFwiYWRtaW5pc3RyYXRvclwiLCBzdGF0dXM6IFwiYWN0aXZlXCIgfSxcbiAgICBdXG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICB1c2VyczogZmFsbGJhY2tVc2VycyxcbiAgICAgIGNvdW50OiBmYWxsYmFja1VzZXJzLmxlbmd0aCxcbiAgICAgIGVycm9yOiAnVcW8eXdhbSBkYW55Y2ggZmFsbGJhY2sgeiBwb3dvZHUgYsWCxJlkdSBBUEknXG4gICAgfSlcbiAgfVxufSAiXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiREFUQV9QUk9WSURFUl9BUElfVVJMIiwicHJvY2VzcyIsImVudiIsIkdFVCIsImNvbnNvbGUiLCJsb2ciLCJyZXNwb25zZSIsImZldGNoIiwiaGVhZGVycyIsIm9rIiwiRXJyb3IiLCJzdGF0dXMiLCJkYXRhIiwianNvbiIsInVzZXJzIiwibWFwIiwidXNlciIsImlkIiwidXNlcl9pZCIsInVzZXJuYW1lIiwibmFtZSIsImZ1bGxfbmFtZSIsImVtYWlsIiwiaW5pdGlhbHMiLCJzcGxpdCIsIm4iLCJqb2luIiwidG9VcHBlckNhc2UiLCJyb2xlIiwidGVuYW50cyIsImZpbHRlciIsInN1Y2Nlc3MiLCJjb3VudCIsImxlbmd0aCIsImVycm9yIiwiZmFsbGJhY2tVc2VycyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/users/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Froute&page=%2Fapi%2Fusers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Froute&page=%2Fapi%2Fusers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_jack_repo_projects_opa_zero_poll_app_api_users_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/users/route.ts */ \"(rsc)/./app/api/users/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/users/route\",\n        pathname: \"/api/users\",\n        filename: \"route\",\n        bundlePath: \"app/api/users/route\"\n    },\n    resolvedPagePath: \"/Users/jack/repo/projects/opa_zero_poll/app/api/users/route.ts\",\n    nextConfigOutput,\n    userland: _Users_jack_repo_projects_opa_zero_poll_app_api_users_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ1c2VycyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGdXNlcnMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZ1c2VycyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmphY2slMkZyZXBvJTJGcHJvamVjdHMlMkZvcGFfemVyb19wb2xsJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNjO0FBQzNGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvamFjay9yZXBvL3Byb2plY3RzL29wYV96ZXJvX3BvbGwvYXBwL2FwaS91c2Vycy9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdXNlcnMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS91c2Vyc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXNlcnMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvamFjay9yZXBvL3Byb2plY3RzL29wYV96ZXJvX3BvbGwvYXBwL2FwaS91c2Vycy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Froute&page=%2Fapi%2Fusers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fusers%2Froute&page=%2Fapi%2Fusers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Froute.ts&appDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjack%2Frepo%2Fprojects%2Fopa_zero_poll&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();