// ==============================================
// SETUP & CONFIGURATION
// ==============================================

// Register GSAP plugins
// Note: Make sure GSAP and CustomEase are loaded in your HTML
if (typeof gsap !== "undefined") {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("hop", "0.9, 0, 0.1, 1");
  }
  
  // 1. PROJECT TITLES
  // Yahan apne projects ke naam likhein
  const items = [
    "Chromatic Loopscape",
    "Solar Bloom",
    "Neon Handscape",
    "Echo Discs",
    "Void Gaze",
    "Gravity Sync",
    "Heat Core",
  
  ];
  
  // 2. IMAGE URLS
  // Yahan apni images ke links replace karein
  const imageUrls = [
    "./images/img1.png",
    "./images/img2.png",
    "./images/img3.png",
    "./images/img4.png",
    "./images/img5.png",
    "./images/img6.png",
    "./images/img7.png",
    
  ];
  
  // 3. SETTINGS
  // Ab control panel nahi hai, to agar kuch change karna ho 
  // to numbers yahan badal sakte hain.
  const settings = {
    // Grid Dimensions
    baseWidth: 400,
    smallHeight: 330,
    largeHeight: 500,
    itemGap: 65,
    
    // Animation Physics
    dragEase: 0.075,      // Drag smoothness (lower = smoother)
    momentumFactor: 200,  // Throw power
    bufferZone: 3,        // Preload area
    
    // Visual Styling
    borderRadius: 0,
    vignetteSize: 0,      // Item inner shadow
    hoverScale: 1.05,     // Hover effect size
    
    // Expanded View
    expandedScale: 0.4,   // 40% of screen width when clicked
    zoomDuration: 0.6,    // Speed of open/close animation
    
    // Background Vignette (Dark corners)
    vignetteStrength: 0.7, 
    pageVignetteSize: 200,
    
    // Overlay (Dark background when item opens)
    overlayOpacity: 0.9,
    overlayEaseDuration: 0.8
  };
  
  // ==============================================
  // CORE VARIABLES
  // ==============================================
  
  const container = document.querySelector(".container");
  const canvas = document.getElementById("canvas");
  const overlay = document.getElementById("overlay");
  const projectTitleElement = document.querySelector(".project-title p");
  
  // Grid Calculation
  let itemSizes = [
    { width: settings.baseWidth, height: settings.smallHeight },
    { width: settings.baseWidth, height: settings.largeHeight }
  ];
  
  let itemGap = settings.itemGap;
  let columns = 4;
  const itemCount = items.length;
  let cellWidth = settings.baseWidth + settings.itemGap;
  let cellHeight = Math.max(settings.smallHeight, settings.largeHeight) + settings.itemGap;
  
  // Drag State
  let isDragging = false;
  let startX, startY;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let dragVelocityX = 0, dragVelocityY = 0;
  let lastDragTime = 0;
  let mouseHasMoved = false;
  
  // Optimization Variables
  let visibleItems = new Set();
  let lastUpdateTime = 0;
  let lastX = 0, lastY = 0;
  
  // Expansion State
  let isExpanded = false;
  let activeItem = null;
  let activeItemId = null;
  let canDrag = true;
  let originalPosition = null;
  let expandedItem = null;
  let overlayAnimation = null;
  
  // Text Animation Variables
  let titleSplit = null;
  let activeCaptionNameSplit = null;
  let activeCaptionNumberSplit = null;
  
  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
  
  // Update CSS variables based on settings
  function initializeStyles() {
    // Border Radius
    document.documentElement.style.setProperty("--border-radius", `${settings.borderRadius}px`);
    
    // Item Vignette
    document.documentElement.style.setProperty("--vignette-size", `${settings.vignetteSize}px`);
    
    // Hover Scale
    document.documentElement.style.setProperty("--hover-scale", settings.hoverScale);
    
    // Page Vignette Calculation
    const strength = settings.vignetteStrength;
    const size = settings.pageVignetteSize;
  
    // Regular vignette
    document.documentElement.style.setProperty("--page-vignette-size", `${size * 1.5}px`);
    document.documentElement.style.setProperty("--page-vignette-color", `rgba(0,0,0,${strength * 0.7})`);
  
    // Strong vignette
    document.documentElement.style.setProperty("--page-vignette-strong-size", `${size * 0.75}px`);
    document.documentElement.style.setProperty("--page-vignette-strong-color", `rgba(0,0,0,${strength * 0.85})`);
  
    // Extreme vignette
    document.documentElement.style.setProperty("--page-vignette-extreme-size", `${size * 0.4}px`);
    document.documentElement.style.setProperty("--page-vignette-extreme-color", `rgba(0,0,0,${strength})`);
  }
  
  function getItemSize(row, col) {
    const sizeIndex = Math.abs((row * columns + col) % itemSizes.length);
    return itemSizes[sizeIndex];
  }
  
  function getItemId(col, row) {
    return `${col},${row}`;
  }
  
  function getItemPosition(col, row) {
    return {
      x: col * cellWidth,
      y: row * cellHeight
    };
  }
  
  // ==============================================
  // TITLE & OVERLAY ANIMATIONS
  // ==============================================
  
  function setAndAnimateTitle(title) {
    if (titleSplit) titleSplit.revert();
    projectTitleElement.textContent = title;
    
    // Check if SplitType is loaded
    if (typeof SplitType !== "undefined") {
      titleSplit = new SplitType(projectTitleElement, { types: "words" });
      gsap.set(titleSplit.words, { y: "100%" });
    }
  }
  
  function animateTitleIn() {
    if (!titleSplit) return;
    gsap.fromTo(titleSplit.words, 
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
    );
  }
  
  function animateTitleOut() {
    if (!titleSplit) return;
    gsap.to(titleSplit.words, {
      y: "-100%", opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out"
    });
  }
  
  function animateOverlayIn() {
    if (overlayAnimation) overlayAnimation.kill();
    overlayAnimation = gsap.to(overlay, {
      opacity: settings.overlayOpacity,
      duration: settings.overlayEaseDuration,
      ease: "power2.inOut",
      overwrite: true
    });
  }
  
  function animateOverlayOut() {
    if (overlayAnimation) overlayAnimation.kill();
    overlayAnimation = gsap.to(overlay, {
      opacity: 0,
      duration: settings.overlayEaseDuration,
      ease: "power2.inOut"
    });
  }
  
  // ==============================================
  // GRID MANAGEMENT
  // ==============================================
  
  function updateVisibleItems() {
    const buffer = settings.bufferZone;
    const viewWidth = window.innerWidth * (1 + buffer);
    const viewHeight = window.innerHeight * (1 + buffer);
    
    // Calculate visible range
    const startCol = Math.floor((-currentX - viewWidth / 2) / cellWidth);
    const endCol = Math.ceil((-currentX + viewWidth * 1.5) / cellWidth);
    const startRow = Math.floor((-currentY - viewHeight / 2) / cellHeight);
    const endRow = Math.ceil((-currentY + viewHeight * 1.5) / cellHeight);
    
    const currentItems = new Set();
    
    // Create or update items
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const itemId = getItemId(col, row);
        currentItems.add(itemId);
        
        if (visibleItems.has(itemId)) continue;
        if (activeItemId === itemId && isExpanded) continue;
        
        const itemSize = getItemSize(row, col);
        const position = getItemPosition(col, row);
        
        // Create DOM elements
        const item = document.createElement("div");
        item.className = "item";
        item.id = itemId;
        Object.assign(item.style, {
          width: `${itemSize.width}px`,
          height: `${itemSize.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`
        });
        
        item.dataset.col = col;
        item.dataset.row = row;
        item.dataset.width = itemSize.width;
        item.dataset.height = itemSize.height;
        
        const itemNum = Math.abs((row * columns + col) % itemCount);
        
        // Image Container
        const imageContainer = document.createElement("div");
        imageContainer.className = "item-image-container";
        
        const img = document.createElement("img");
        img.src = imageUrls[itemNum % imageUrls.length];
        img.alt = items[itemNum];
        imageContainer.appendChild(img);
        item.appendChild(imageContainer);
        
        // Captions
        const captionElement = document.createElement("div");
        captionElement.className = "item-caption";
        
        const nameElement = document.createElement("div");
        nameElement.className = "item-name";
        nameElement.textContent = items[itemNum];
        
        const numberElement = document.createElement("div");
        numberElement.className = "item-number";
        numberElement.textContent = `#${(itemNum + 1).toString().padStart(5, "0")}`;
        
        captionElement.appendChild(nameElement);
        captionElement.appendChild(numberElement);
        item.appendChild(captionElement);
        
        // Event Listener
        item.addEventListener("click", () => {
          if (mouseHasMoved || isDragging) return;
          handleItemClick(item, itemNum);
        });
        
        canvas.appendChild(item);
        visibleItems.add(itemId);
      }
    }
    
    // Cleanup hidden items
    visibleItems.forEach((itemId) => {
      if (!currentItems.has(itemId) || (activeItemId === itemId && isExpanded)) {
        const item = document.getElementById(itemId);
        if (item && item.parentNode === canvas) {
          canvas.removeChild(item);
        }
        visibleItems.delete(itemId);
      }
    });
  }
  
  // ==============================================
  // INTERACTION LOGIC (CLICK & EXPAND)
  // ==============================================
  
  function handleItemClick(item, itemIndex) {
    if (isExpanded) {
      if (expandedItem) closeExpandedItem();
    } else {
      expandItem(item, itemIndex);
    }
  }
  
  function expandItem(item, itemIndex) {
    isExpanded = true;
    activeItem = item;
    activeItemId = item.id;
    canDrag = false;
    container.style.cursor = "auto";
    
    const imgSrc = item.querySelector("img").src;
    const titleIndex = itemIndex % items.length;
    const itemWidth = parseInt(item.dataset.width);
    const itemHeight = parseInt(item.dataset.height);
    
    setAndAnimateTitle(items[titleIndex]);
    
    // Animation Preparation (Cloning Caption)
    const nameElement = item.querySelector(".item-name");
    const numberElement = item.querySelector(".item-number");
    const nameText = nameElement.textContent;
    const numberText = numberElement.textContent;
    
    const captionClone = item.querySelector(".item-caption").cloneNode(true);
    captionClone.classList.add("caption-clone");
    
    // Position Clone
    const captionRect = item.querySelector(".item-caption").getBoundingClientRect();
    captionClone.style.left = `${captionRect.left}px`;
    captionClone.style.bottom = `${window.innerHeight - captionRect.bottom}px`;
    captionClone.style.width = `${captionRect.width}px`;
    captionClone.style.zIndex = "10002";
    document.body.appendChild(captionClone);
    
    // Hide original
    item.querySelector(".item-caption").style.opacity = "0";
    
    // Animate Clone Out
    if (typeof SplitType !== "undefined") {
      const nameCloneSplit = new SplitType(captionClone.querySelector(".item-name"), { types: "words" });
      const numberCloneSplit = new SplitType(captionClone.querySelector(".item-number"), { types: "words" });
      
      gsap.to(nameCloneSplit.words, { y: "100%", opacity: 0, duration: 0.6, stagger: 0.03, ease: "power3.in" });
      gsap.to(numberCloneSplit.words, { 
        y: "100%", opacity: 0, duration: 0.6, stagger: 0.02, delay: 0.05, ease: "power3.in",
        onComplete: () => { if (captionClone.parentNode) document.body.removeChild(captionClone); }
      });
    } else {
      // Fallback if SplitType missing
      gsap.to(captionClone, { opacity: 0, duration: 0.5, onComplete: () => captionClone.remove() });
    }
  
    // Save State
    const rect = item.getBoundingClientRect();
    originalPosition = {
      id: item.id,
      rect: rect,
      imgSrc: imgSrc,
      width: itemWidth,
      height: itemHeight,
      nameText: nameText,
      numberText: numberText
    };
    
    // Show Overlay
    overlay.classList.add("active");
    animateOverlayIn();
    
    // Create Expanded Item
    expandedItem = document.createElement("div");
    expandedItem.className = "expanded-item";
    Object.assign(expandedItem.style, {
      width: `${itemWidth}px`,
      height: `${itemHeight}px`,
      zIndex: "10000",
      borderRadius: `var(--border-radius, 0px)`
    });
    
    const img = document.createElement("img");
    img.src = imgSrc;
    expandedItem.appendChild(img);
    expandedItem.addEventListener("click", closeExpandedItem);
    document.body.appendChild(expandedItem);
    
    // Fade out other items
    document.querySelectorAll(".item").forEach((el) => {
      if (el !== activeItem) {
        gsap.to(el, { opacity: 0, duration: settings.overlayEaseDuration, ease: "power2.inOut" });
      }
    });
    
    // Calculate Target Size
    const targetWidth = window.innerWidth * settings.expandedScale;
    const aspectRatio = itemHeight / itemWidth;
    const targetHeight = targetWidth * aspectRatio;
    
    // Animation
    gsap.delayedCall(0.5, animateTitleIn);
    gsap.fromTo(expandedItem,
      {
        width: itemWidth,
        height: itemHeight,
        x: rect.left + itemWidth / 2 - window.innerWidth / 2,
        y: rect.top + itemHeight / 2 - window.innerHeight / 2
      },
      {
        width: targetWidth,
        height: targetHeight,
        x: 0, y: 0,
        duration: settings.zoomDuration,
        ease: "hop"
      }
    );
  }
  
  function closeExpandedItem() {
    if (!expandedItem || !originalPosition) return;
    
    animateTitleOut();
    animateOverlayOut();
    
    // Fade items back in
    document.querySelectorAll(".item").forEach((el) => {
      if (el.id !== activeItemId) {
        gsap.to(el, { opacity: 1, duration: settings.overlayEaseDuration, delay: 0.3, ease: "power2.inOut" });
      }
    });
    
    // Restore Original Item Text
    const originalItem = document.getElementById(activeItemId);
    if (originalItem) {
      originalItem.querySelector(".item-name").textContent = originalPosition.nameText;
      originalItem.querySelector(".item-number").textContent = originalPosition.numberText;
      originalItem.querySelector(".item-caption").style.opacity = "0";
    }
    
    const { rect: originalRect, width: originalWidth, height: originalHeight } = originalPosition;
    
    // Animate Closing
    gsap.to(expandedItem, {
      width: originalWidth,
      height: originalHeight,
      x: originalRect.left + originalWidth / 2 - window.innerWidth / 2,
      y: originalRect.top + originalHeight / 2 - window.innerHeight / 2,
      duration: settings.zoomDuration,
      ease: "hop",
      onComplete: () => {
        // Restore Caption Animation
        if (originalItem) {
          const captionElement = originalItem.querySelector(".item-caption");
          const captionClone = document.createElement("div");
          captionClone.className = "caption-clone";
          captionClone.innerHTML = captionElement.innerHTML;
          
          const captionRect = captionElement.getBoundingClientRect();
          Object.assign(captionClone.style, {
            position: "fixed",
            left: `${captionRect.left}px`,
            bottom: `${window.innerHeight - captionRect.bottom}px`,
            width: `${captionRect.width}px`,
            padding: "10px",
            zIndex: "10002"
          });
          
          document.body.appendChild(captionClone);
          
          if (typeof SplitType !== "undefined") {
              const nameCloneSplit = new SplitType(captionClone.querySelector(".item-name"), { types: "words" });
              const numberCloneSplit = new SplitType(captionClone.querySelector(".item-number"), { types: "words" });
              
              // Set Initial
              gsap.set([nameCloneSplit.words, numberCloneSplit.words], { y: "100%", opacity: 0 });
              
              // Animate In
              gsap.to(nameCloneSplit.words, { y: "0%", opacity: 1, duration: 0.7, stagger: 0.03, ease: "power3.out" });
              gsap.to(numberCloneSplit.words, { 
                y: "0%", opacity: 1, duration: 0.7, stagger: 0.02, delay: 0.05, ease: "power3.out",
                onComplete: () => {
                  captionElement.style.opacity = "1";
                  captionClone.remove();
                }
              });
          } else {
               gsap.to(captionClone, { opacity: 1, duration: 0.5, onComplete: () => {
                  captionElement.style.opacity = "1";
                  captionClone.remove();
               }});
          }
        }
        
        // Cleanup
        if (expandedItem && expandedItem.parentNode) expandedItem.remove();
        if (originalItem) originalItem.style.visibility = "visible";
        
        expandedItem = null;
        isExpanded = false;
        activeItem = null;
        originalPosition = null;
        activeItemId = null;
        canDrag = true;
        container.style.cursor = "grab";
        dragVelocityX = 0;
        dragVelocityY = 0;
        overlay.classList.remove("active");
      }
    });
  }
  
  // ==============================================
  // MAIN ANIMATION LOOP
  // ==============================================
  
  function animate() {
    if (canDrag) {
      const ease = settings.dragEase;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      
      canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
      
      const now = Date.now();
      const distMoved = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
      
      // Only update DOM if moved significantly or enough time passed
      if (distMoved > 100 || now - lastUpdateTime > 120) {
        updateVisibleItems();
        lastX = currentX;
        lastY = currentY;
        lastUpdateTime = now;
      }
    }
    requestAnimationFrame(animate);
  }
  
  // ==============================================
  // EVENT LISTENERS
  // ==============================================
  
  // Mouse Events
  container.addEventListener("mousedown", (e) => {
    if (!canDrag) return;
    isDragging = true;
    mouseHasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    container.style.cursor = "grabbing";
  });
  
  window.addEventListener("mousemove", (e) => {
    if (!isDragging || !canDrag) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;
    
    const now = Date.now();
    const dt = Math.max(10, now - lastDragTime);
    lastDragTime = now;
    
    dragVelocityX = dx / dt;
    dragVelocityY = dy / dt;
    
    targetX += dx;
    targetY += dy;
    
    startX = e.clientX;
    startY = e.clientY;
  });
  
  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    if (canDrag) {
      container.style.cursor = "grab";
      // Add momentum
      if (Math.abs(dragVelocityX) > 0.1 || Math.abs(dragVelocityY) > 0.1) {
        targetX += dragVelocityX * settings.momentumFactor;
        targetY += dragVelocityY * settings.momentumFactor;
      }
    }
  });
  
  // Touch Events
  container.addEventListener("touchstart", (e) => {
    if (!canDrag) return;
    isDragging = true;
    mouseHasMoved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  
  window.addEventListener("touchmove", (e) => {
    if (!isDragging || !canDrag) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;
    
    targetX += dx;
    targetY += dy;
    
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  
  window.addEventListener("touchend", () => {
    isDragging = false;
  });
  
  // Other Events
  overlay.addEventListener("click", () => {
    if (isExpanded) closeExpandedItem();
  });
  
  window.addEventListener("resize", () => {
    if (isExpanded && expandedItem) {
      // Resize expanded item
      const targetWidth = window.innerWidth * settings.expandedScale;
      const aspectRatio = originalPosition.height / originalPosition.width;
      const targetHeight = targetWidth * aspectRatio;
      
      gsap.to(expandedItem, {
        width: targetWidth,
        height: targetHeight,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      updateVisibleItems();
    }
    // Re-calculate page vignette sizes on resize
    initializeStyles();
  });
  
  // ==============================================
  // INITIALIZATION
  // ==============================================
  
  initializeStyles();
  updateVisibleItems();
  animate();
  
  // Panel initialization removed.