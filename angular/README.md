# 🔐 AngularFireRolekit

A complete role-based user management starter built with **Angular 20**, **Firebase v11**, and **Angular Material**.

Includes:
- Firebase Auth with email/password
- Admin/Editor/Viewer role-based access
- Article management
- Responsive UI using Angular Material
- Route guards & loader spinners

---

## 🚀 Features

- ✅ Firebase Authentication (Email/Password)
- 🔐 Role-based routing: Admin, Editor, Viewer
- 👑 Admin dashboard: manage users & roles
- ✍️ Editor panel: create/edit/delete articles
- 👀 Viewer mode: read-only article viewer
- ⚡ Angular Material design
- 🔄 Realtime Firestore sync
- 🔐 Route guards for security
- 🎡 Loading spinners on all data fetches

---

## 📁 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/angular-fire-rolekit.git
cd angular-fire-rolekit
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Register a Web App under the project settings
4. Copy your Firebase config and paste it into:

```ts
// Replace this in src/environments/environment.ts

export const environment = {
  production: false,
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
    measurementId: '...'
  }
};
```

> 💡 You can copy `src/environments/environment.sample.ts` as a starting point.

---

## 🔐 Admin Creation

Users signedup will have 'viewer' role, go to firebase storage and change role to 'admin' to use admin page to update user roles.

---

## 🧪 Run Locally

### Development Server

```bash
npm install
ng serve
```

Open your browser: [http://localhost:4200](http://localhost:4200)

---

## 🗃 Firebase Collections

- `users`: { uid, email, role }
- `articles`: { title, content, createdAt }

---

## 🔧 Angular CLI Commands

### Generate Component

```bash
ng generate component component-name
```

### Build the Project

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

---

## 🧪 Testing

### Unit Tests

```bash
ng test
```

### End-to-End Tests

```bash
ng e2e
```

You can integrate your preferred e2e testing framework.

---

## 📦 Deployment

To build for production:

```bash
ng build --configuration production
```

Deploy using Firebase Hosting, Vercel, Netlify, etc.

## License

This project is licensed under the [MIT License](./LICENSE).