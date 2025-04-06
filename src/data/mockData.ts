
import { ProjectSuggestion } from "../types";

export const mockProjects: ProjectSuggestion[] = [
  {
    id: "1",
    title: "AI-powered Weather Dashboard",
    description: "Build a weather app that uses machine learning to predict local weather patterns with higher accuracy than traditional forecasts. Includes visualization of weather data and personalized recommendations.",
    difficulty: "intermediate",
    skills: ["React", "TensorFlow.js", "Chart.js", "Weather API"],
    timeEstimate: "3-4 weeks",
    resources: [
      {
        title: "TensorFlow.js Documentation",
        url: "https://www.tensorflow.org/js",
        type: "documentation"
      },
      {
        title: "Building ML Models for Weather Prediction",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Weather Dashboard GitHub Repo",
        url: "#",
        type: "github"
      }
    ],
    tags: ["AI/ML", "Data Visualization", "API Integration", "Frontend"]
  },
  {
    id: "2",
    title: "E-commerce Recommendation Engine",
    description: "Create a content-based recommendation engine that suggests products based on user browsing history and preferences. Implement collaborative filtering algorithms for personalized shopping experiences.",
    difficulty: "advanced",
    skills: ["Python", "Flask", "MongoDB", "Machine Learning"],
    timeEstimate: "6-8 weeks",
    resources: [
      {
        title: "Introduction to Recommendation Systems",
        url: "#",
        type: "article"
      },
      {
        title: "Building Recommendation APIs with Flask",
        url: "#",
        type: "tutorial"
      },
      {
        title: "E-commerce Recommendation Engine GitHub Repo",
        url: "#",
        type: "github"
      }
    ],
    tags: ["AI/ML", "Backend", "Databases", "API"]
  },
  {
    id: "3",
    title: "Personal Finance Tracker",
    description: "Build a web application that helps users track their income, expenses, and savings goals. Implement data visualization to provide insights into spending habits.",
    difficulty: "beginner",
    skills: ["JavaScript", "React", "Firebase", "Chart.js"],
    timeEstimate: "2-3 weeks",
    resources: [
      {
        title: "React Hooks for State Management",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Data Visualization with Chart.js",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Firebase Authentication and Firestore Guide",
        url: "#",
        type: "documentation"
      }
    ],
    tags: ["Frontend", "Data Visualization", "Web App", "Database"]
  },
  {
    id: "4",
    title: "Real-time Multiplayer Game",
    description: "Develop a simple but fun multiplayer game using WebSockets for real-time communication between players. Implement game mechanics, user authentication, and a leaderboard system.",
    difficulty: "intermediate",
    skills: ["JavaScript", "Node.js", "Socket.io", "Canvas API"],
    timeEstimate: "4-6 weeks",
    resources: [
      {
        title: "Introduction to Socket.io",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Game Development with JavaScript",
        url: "#",
        type: "article"
      },
      {
        title: "Multiplayer Game GitHub Repo",
        url: "#",
        type: "github"
      }
    ],
    tags: ["Game Development", "Real-time", "WebSockets", "Full Stack"]
  },
  {
    id: "5",
    title: "Smart Home IoT Dashboard",
    description: "Create a dashboard to monitor and control IoT devices in a smart home environment. Implement real-time data updates and automated routines based on user preferences.",
    difficulty: "advanced",
    skills: ["React", "Node.js", "MQTT", "IoT Protocols"],
    timeEstimate: "5-7 weeks",
    resources: [
      {
        title: "Introduction to MQTT for IoT",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Building Real-time Dashboards with React",
        url: "#",
        type: "article"
      },
      {
        title: "Smart Home IoT GitHub Repo",
        url: "#",
        type: "github"
      }
    ],
    tags: ["IoT", "Real-time", "Dashboard", "Full Stack"]
  },
  {
    id: "6",
    title: "Portfolio Website with CMS",
    description: "Build a portfolio website with a content management system (CMS) to easily update projects, blog posts, and other content without touching code.",
    difficulty: "beginner",
    skills: ["React", "Gatsby", "GraphQL", "Headless CMS"],
    timeEstimate: "2-3 weeks",
    resources: [
      {
        title: "Getting Started with Gatsby",
        url: "#",
        type: "tutorial"
      },
      {
        title: "Headless CMS Options Comparison",
        url: "#",
        type: "article"
      },
      {
        title: "Portfolio with CMS GitHub Repo",
        url: "#",
        type: "github"
      }
    ],
    tags: ["Frontend", "CMS", "Web Development", "Portfolio"]
  }
];
