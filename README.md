# Mobile Restaurant Review Application
## Udacity Mobile Web Specialist Nanodegree Final Project

There are three branches: Master, Refactor, and Simplified.  Master is the branch that was turned in to be graded.  Refactor is a newer branch that improved modularity & readability of the code by implemeting webpack and sass. 

## Grading Criteria
In this stage the critera are as follows:

## 1. Functionality

### A. User Interface
Users are able to mark a restaurant as a favorite, this toggle is visible in the application. A form is added to allow users to add their own reviews for a restaurant. Form submission works properly and adds a new review to the database.

### B. Offline Use
The client application works offline. JSON responses are cached using the IndexedDB API. Any data previously accessed while connected is reachable while offline. User is able to add a review to a restaurant while offline and the review is sent to the server when connectivity is re-established.

## 2. Responsive Design and Accessibility

### A. Responsive Design
The application maintains a responsive design on mobile, tablet and desktop viewports. All new features are responsive, including the form to add a review and the control for marking a restaurant as a favorite.

### B. Accessibility
The application retains accessibility features from the previous projects. Images have alternate text, the application uses appropriate focus management for navigation, and semantic elements and ARIA attributes are used correctly. Roles are correctly defined for all elements of the review form.

## 3. Performance

### Site Performance
Lighthouse targets for each category exceed:

Progressive Web App: >90
Performance: >90
Accessibility: >90

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

1. Install Node if you don't already have it. It can be downloaded here: https://nodejs.org/en/download/

2. Install Gulp and its command line interface as global modules after you have the node package manager through the command-line/terminal
```
sudo npm install --global gulp gulp-cli
```
3. This mobile application will be sending HTTP requests to a development server that you will need to have running locally.  It can be cloned from https://github.com/udacity/mws-restaurant-stage-3.  Follow its readme instructions to install and run the server. 

4. clone this repository and follow the instructions below.

### Installing

In order to get the environment up and running first install all the dependencies

```
npm i
```

then build the app:

```
npm run build
```

and then start the server

```
npm run start 
```

## Authors

* **Josh Lockrow** - *Initial work* - [jelockro ](https://github.com/jelockro)

## Shout Outs
I would like to thank Doug Brown and SeetD both of whose help was crucial for my finishing this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
