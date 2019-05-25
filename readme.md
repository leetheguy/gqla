# GraphQL Admin (Alpha)
### A drop-in CMS for full CRUD access to your GraphQL data.

## Introduction
GraphQL-Admin is a web component that can be added to any webpage in any framework. It connects to a GraphQL end-point and automatically renders a list and a form that are relevant to the data it recieves. GraphQL also makes working with relational data easy by rendering the forms and lists for connected tables in a side by side view.

GraphQL is still in a very early Alpha release. It's currently only meant to work with Hasura. But it may work with other GraphQL end-points if they use a similar structure. I built GraphQL to solve a common problem I've run into with every mobile and web app I've built. How do I give my client raw access to all of their data without having to create multiple custom interfaces for every table in every project? I will continue to build on GraphQL to satisfy future client needs.

## Installation



## Configuration



## Routing
GraphQL-Admin is completely decoupled from your app's routing. However, the layout is dependent on a string that is similar to a RESTful route. That means that you can pass in the relevant portion of your existing route and GraphQL will know how to handle it.

Route strings are expected to have the following format:

`table_name/[:id/]table_name/[:id/]tablename/...`

Id's are optional. An edit form will be rendered if one is recieved. Otherwise a create form will be rendered.

## Planned Features

