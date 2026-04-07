/**
 * PPT风格幻灯片导航系统
 * 支持键盘、鼠标点击、触摸滑动控制翻页
 */

class SlidePresentation {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.slides = [];
        this.navArrows = null;
        this.pageIndicator = null;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.autoHideTimer = null;
        this.pageHideTimer = null;

        this.init();
    }

    init() {
        // 获取所有幻灯片
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) {
            console.error('No slides found!');
            return;
        }

        // 获取已存在的导航元素（由HTML提供）
        this.navArrows = document.querySelector('.nav-arrows');
        this.pageIndicator = document.querySelector('.page-indicator');

        // 如果HTML中没有，动态创建
        if (!this.navArrows) this.createNavigation();
        if (!this.pageIndicator) this.createPageIndicator();

        // 绑定导航按钮点击事件
        this.bindNavButtonEvents();

        // 绑定其他事件
        this.bindEvents();

        // 显示第一张幻灯片
        this.showSlide(0);

        // 初始显示导航箭头
        this.showNavArrows();
    }

    createNavigation() {
        // 创建导航箭头容器
        const navContainer = document.createElement('div');
        navContainer.className = 'nav-arrows';
        navContainer.innerHTML = `
            <button class="nav-arrow prev-arrow" aria-label="上一页">
                <svg viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </button>
            <button class="nav-arrow next-arrow" aria-label="下一页">
                <svg viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
            </button>
        `;
        document.body.appendChild(navContainer);

        this.navArrows = navContainer;

        // 绑定箭头点击事件
        const prevBtn = navContainer.querySelector('.prev-arrow');
        const nextBtn = navContainer.querySelector('.next-arrow');

        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
    }

    createPageIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'page-indicator';
        indicator.innerHTML = `
            <span class="current-page">1</span>
            <span class="page-divider"></span>
            <span class="total-pages">${this.totalSlides}</span>
        `;
        document.body.appendChild(indicator);
        this.pageIndicator = indicator;
    }

    bindNavButtonEvents() {
        // 绑定导航按钮点击事件
        const prevBtn = this.navArrows.querySelector('.prev-arrow');
        const nextBtn = this.navArrows.querySelector('.next-arrow');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }

    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.showSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.showSlide(this.totalSlides - 1);
            }
        });

        // 鼠标移动显示/隐藏导航箭头、键盘提示和页码
        document.addEventListener('mousemove', (e) => {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const mouseY = e.clientY;
            const mouseX = e.clientX;

            // 当鼠标接近底部时显示导航和键盘提示
            if (mouseY > windowHeight - 150) {
                this.showNavArrows();
            } else {
                // 延迟隐藏
                clearTimeout(this.autoHideTimer);
                this.autoHideTimer = setTimeout(() => {
                    this.hideNavArrows();
                }, 500); // 0.5秒后消失
            }

            // 当鼠标接近右上角时显示页码
            if (mouseX > windowWidth - 200 && mouseY < 150) {
                this.showPageIndicator();
            } else {
                clearTimeout(this.pageHideTimer);
                this.pageHideTimer = setTimeout(() => {
                    this.hidePageIndicator();
                }, 500); // 0.5秒后消失
            }
        });

        // 触摸事件
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // 窗口大小改变
        window.addEventListener('resize', () => {
            this.showNavArrows();
            setTimeout(() => {
                if (window.innerHeight > 150) {
                    this.hideNavArrows();
                }
            }, 2000);
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    showNavArrows() {
        clearTimeout(this.autoHideTimer);
        this.navArrows.classList.add('visible');
        // 键盘提示也同步显示/隐藏
        const keyboardHint = document.querySelector('.keyboard-hint');
        if (keyboardHint) {
            keyboardHint.classList.add('visible');
        }
    }

    hideNavArrows() {
        this.navArrows.classList.remove('visible');
        // 键盘提示也同步隐藏
        const keyboardHint = document.querySelector('.keyboard-hint');
        if (keyboardHint) {
            keyboardHint.classList.remove('visible');
        }
    }

    showPageIndicator() {
        clearTimeout(this.pageHideTimer);
        if (this.pageIndicator) {
            this.pageIndicator.classList.add('visible');
        }
    }

    hidePageIndicator() {
        if (this.pageIndicator) {
            this.pageIndicator.classList.remove('visible');
        }
    }

    updateNavigation() {
        // 更新箭头状态
        const prevBtn = this.navArrows.querySelector('.prev-arrow');
        const nextBtn = this.navArrows.querySelector('.next-arrow');

        prevBtn.classList.toggle('disabled', this.currentSlide === 0);
        nextBtn.classList.toggle('disabled', this.currentSlide === this.totalSlides - 1);

        // 更新页码
        const currentPageEl = this.pageIndicator.querySelector('.current-page');
        currentPageEl.textContent = this.currentSlide + 1;
    }

    showSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;
        if (index < 0 || index >= this.totalSlides) return;

        this.isAnimating = true;

        const direction = index > this.currentSlide ? 1 : -1;
        const oldSlide = this.slides[this.currentSlide];
        const newSlide = this.slides[index];

        // 移除当前幻灯片的active类，添加滑出动画
        oldSlide.classList.remove('active');
        if (direction > 0) {
            // 向后翻页：旧幻灯片向左滑出
            oldSlide.classList.add('prev');
        } else {
            // 向前翻页：旧幻灯片向右滑出
            oldSlide.classList.add('next');
        }

        // 设置新幻灯片初始位置（从反方向进入）
        newSlide.classList.add(direction > 0 ? 'next' : 'prev');
        // 强制重绘以应用初始位置
        void newSlide.offsetWidth;
        // 添加active类触发滑入动画
        newSlide.classList.add('active');
        newSlide.classList.remove('prev', 'next');

        // 更新当前索引
        this.currentSlide = index;

        // 更新导航状态
        this.updateNavigation();

        // 重置动画状态
        setTimeout(() => {
            this.isAnimating = false;
            // 清理所有幻灯片的动画类
            this.slides.forEach((slide, i) => {
                if (i !== this.currentSlide) {
                    slide.classList.remove('prev', 'next');
                }
            });
        }, 600);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }

    goToSlide(index) {
        this.showSlide(index);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.presentation = new SlidePresentation();
});

// 添加页面过渡动画
document.addEventListener('DOMContentLoaded', () => {
    // 添加加载动画
    document.body.classList.add('loaded');
});
