# Infinite Draggable Slider 

A smooth, interactive, and infinite gallery slider built with **GSAP** and **CustomEase**. This project focuses on creating a high-end feel with fluid motion and seamless looping.

🔗 **Live Demo:** [Check it out here](https://infinite-draggable-slider.vercel.app/)

[![image.png](https://i.postimg.cc/YSCL2Lzy/image.png)](https://postimg.cc/dhgV41X8)

## 🚀 Key Features

* **Infinite Loop:** The gallery scrolls seamlessly without a distinct start or end point.
* **Draggable Interface:** Users can grab and throw the slider with realistic inertia.
* **Custom Easing:** Uses GSAP's `CustomEase` for a unique, non-linear animation feel that isn't possible with standard CSS.
* **Responsive:** Adapts to different screen sizes.

## 🛠️ Tech Stack

* **HTML5 / CSS3**
* **JavaScript (ES6+)**
* **GSAP (GreenSock Animation Platform):** Used for the core animation engine.
    * `Draggable` Plugin
    * `CustomEase` Plugin

## 📦 How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/infinite-draggable-slider.git](https://github.com/your-username/infinite-draggable-slider.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd infinite-draggable-slider
    ```
3.  **Install dependencies (if using a package manager):**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    *(Or simply open `index.html` in your browser if using Vanilla JS).*

## 💡 How it Works

The core logic revolves around GSAP's `ticker` or timeline functions to constantly update the position of the slider items. When the user drags, the automatic movement pauses and hands control over to the `Draggable` instance. Once released, the slider snaps back into the flow using a custom ease curve to make the transition imperceptible.

## 🤝 Contributing

Feel free to fork this repo and play around with the `CustomEase` values to create different friction and bounce effects!

---
