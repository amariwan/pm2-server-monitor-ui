# What Is Middleware?
- A request handler with access to the application's request-response cycle is known as middleware.
- It's a function that holds the request object, the response object, and the middleware function.
- Middleware can also send the response to the server before the request.
- The next middleware function is commonly represented as a variable named next.
- Simply middleware is a function that can only be applied using routes.
- We can access and modify request and response data using middleware.

![Alt text](https://www.simplilearn.com/ice9/free_resources_article_thumb/ExpressJS_Middleware_1.png)
## Functions of Middleware
