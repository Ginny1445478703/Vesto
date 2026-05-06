const CATEGORIES = [
    { name: '数码产品', color: '#667eea' },
    { name: '家具家电', color: '#f093fb' },
    { name: '交通工具', color: '#4ade80' },
    { name: '房产', color: '#fbbf24' },
    { name: '投资理财产品', color: '#fb923c' },
    { name: '其他', color: '#94a3b8' }
];

let assets = [];
let currentUser = null;

// 登录相关函数
function checkLogin() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainApp();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.nav-bar').style.display = 'none';
    document.querySelector('.header').style.display = 'none';
}

function showMainApp() {
    document.getElementById('login-modal').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    document.querySelector('.nav-bar').style.display = 'flex';
    document.querySelector('.header').style.display = 'block';
    document.getElementById('username').textContent = currentUser.username;
    
    // 初始化卡片显示状态 - 默认只显示总览
    document.getElementById('overview-card').style.display = 'block';
    document.getElementById('category-card').style.display = 'none';
    document.getElementById('status-card').style.display = 'none';
    document.getElementById('flow-card').style.display = 'none';
    
    loadAssets();
    refreshAll();
    checkOnboarding();
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    } else {
        alert('用户名或密码错误');
    }
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const repassword = document.getElementById('register-repassword').value;
    
    if (!username || !password) {
        alert('请填写完整信息');
        return;
    }
    
    if (password !== repassword) {
        alert('两次密码不一致');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username)) {
        alert('用户名已存在');
        return;
    }
    
    const newUser = { id: Date.now(), username, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showMainApp();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showLoginModal();
}

// 新手引导
function checkOnboarding() {
    // 使用用户ID关联新手引导状态
    const completed = localStorage.getItem('onboardingCompleted_' + currentUser.id);
    if (!completed) {
        showOnboarding();
    }
}

function showOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    overlay.style.display = 'block';
    
    // 隐藏所有步骤
    document.querySelectorAll('.onboarding-step').forEach(step => step.style.display = 'none');
    
    // 显示步骤1
    document.getElementById('step-1').style.display = 'block';
    
    // 使用闭包确保每个按钮正确绑定
    const steps = [1, 2, 3, 4, 5, 6];
    steps.forEach((stepNum) => {
        const btn = document.getElementById('step' + stepNum + '-btn');
        if (btn) {
            btn.onclick = function() {
                document.getElementById('step-' + stepNum).style.display = 'none';
                if (stepNum < 6) {
                    document.getElementById('step-' + (stepNum + 1)).style.display = 'block';
                } else {
                    // 完成引导，使用用户ID保存状态
                    overlay.style.display = 'none';
                    localStorage.setItem('onboardingCompleted_' + currentUser.id, 'true');
                }
            };
        }
    });
}

function loadAssets() {
    const saved = localStorage.getItem('assets_' + currentUser.id);
    if (saved) {
        assets = JSON.parse(saved);
    } else {
        assets = [
            { id: 1, name: 'iPhone 15', category: '数码产品', cost: 5999, date: '2023-09-22', value: 4500, status: 'active', sellDate: null, sellPrice: null },
            { id: 2, name: 'MacBook Pro', category: '数码产品', cost: 12999, date: '2022-06-15', value: 8000, status: 'active', sellDate: null, sellPrice: null },
            { id: 3, name: '小米电视', category: '家具家电', cost: 3999, date: '2023-01-10', value: 2500, status: 'active', sellDate: null, sellPrice: null },
            { id: 4, name: 'AirPods Pro', category: '数码产品', cost: 1899, date: '2021-12-01', value: 800, status: 'retired', sellDate: null, sellPrice: null },
            { id: 5, name: 'iPhone 13', category: '数码产品', cost: 5999, date: '2021-09-24', value: 0, status: 'sold', sellDate: '2023-09-20', sellPrice: 2800 },
            { id: 6, name: '华为手表', category: '数码产品', cost: 2999, date: '2022-03-15', value: 0, status: 'sold', sellDate: '2024-01-10', sellPrice: 1500 }
        ];
        saveAssets();
    }
}

function saveAssets() {
    localStorage.setItem('assets_' + currentUser.id, JSON.stringify(assets));
}

function formatMoney(value) {
    return parseFloat(value).toFixed(2);
}

function calculateDays(dateStr) {
    const purchaseDate = new Date(dateStr);
    const now = new Date();
    const diff = now - purchaseDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTotalValue() {
    return assets.filter(a => a.status !== 'sold').reduce((sum, a) => sum + a.value, 0);
}

function getTotalCost() {
    return assets.filter(a => a.status !== 'sold').reduce((sum, a) => sum + a.cost, 0);
}

function getAppreciationRate() {
    const totalValue = getTotalValue();
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return Math.round((totalValue / totalCost) * 100);
}

function getAvgDailyCost() {
    let totalDays = 0;
    let totalCost = 0;
    assets.filter(a => a.status !== 'sold').forEach(asset => {
        const days = calculateDays(asset.date);
        totalDays += days;
        totalCost += asset.cost;
    });
    if (totalDays === 0) return 0;
    return Math.round(totalCost / totalDays * 100) / 100;
}

// 更新总览页面的资产列表
function updateOverviewAssetList() {
    const activeAssets = assets.filter(a => a.status !== 'sold');
    const list = document.getElementById('overview-asset-list');
    
    // 确保获取到正确的元素
    if (!list) {
        console.error('overview-asset-list element not found');
        return;
    }
    
    console.log('Active assets:', activeAssets);
    
    if (activeAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">暂无资产，点击下方 + 按钮添加</div>';
        return;
    }
    list.innerHTML = activeAssets.map(asset => {
        const days = calculateDays(asset.date);
        const dailyCost = days > 0 ? (asset.cost / days).toFixed(2) : '0.00';
        const tag = getStatusTag(asset.status);
        return `
            <div class="asset-item">
                <div class="asset-icon" style="background: ${getCategoryColor(asset.category)}20">${getCategoryIcon(asset.category)}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name} <span class="status-tag ${tag.class}">${tag.text}</span></div>
                    <div class="asset-detail">${asset.category} · 日均成本 ¥${dailyCost}</div>
                </div>
                <div class="asset-value">¥${formatMoney(asset.value)}</div>
            </div>
        `;
    }).join('');
}

// 修改updateOverview函数
function updateOverview() {
    animateNumber(document.getElementById('total-value'), getTotalValue());
    animateNumber(document.getElementById('asset-count'), assets.filter(a => a.status !== 'sold').length);
    animateNumber(document.getElementById('avg-cost'), getAvgDailyCost());
    animateNumber(document.getElementById('appreciation-rate'), getAppreciationRate());
    updateOverviewAssetList();  // 添加这一行
}

function updateCategoryChart() {
    const categoryData = {};
    let totalValue = 0;
    assets.filter(a => a.status !== 'sold').forEach(asset => {
        if (!categoryData[asset.category]) categoryData[asset.category] = 0;
        categoryData[asset.category] += asset.value;
        totalValue += asset.value;
    });
    let dashOffset = 0;
    const circumference = 2 * Math.PI * 45;
    let svgContent = '<circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="12"/>';
    CATEGORIES.forEach(cat => {
        const value = categoryData[cat.name] || 0;
        if (value > 0 && totalValue > 0) {
            const percentage = value / totalValue;
            const dashArray = percentage * circumference;
            svgContent += `<circle cx="50" cy="50" r="45" fill="none" stroke="${cat.color}" stroke-width="12" stroke-dasharray="${dashArray} ${circumference}" stroke-dashoffset="${-dashOffset}" transform="rotate(-90 50 50)"/>`;
            dashOffset += dashArray;
        }
    });
    document.querySelector('.pie-chart svg').innerHTML = svgContent;
    document.getElementById('category-rate').textContent = getAppreciationRate() + '%';
    const legendHTML = Object.keys(categoryData).map(name => {
        const cat = CATEGORIES.find(c => c.name === name);
        return `<div class="legend-item"><div class="legend-color" style="background: ${cat?.color || '#94a3b8'}"></div>${name}</div>`;
    }).join('');
    document.getElementById('category-legend').innerHTML = legendHTML || '<div class="empty-state">暂无资产数据</div>';
}

function getStatusTag(status) {
    const tags = { active: { class: 'status-active', text: '服役中' }, retired: { class: 'status-retired', text: '已退役' }, sold: { class: 'status-sold', text: '已卖出' } };
    return tags[status] || tags.active;
}

function getCategoryColor(category) {
    const cat = CATEGORIES.find(c => c.name === category);
    return cat?.color || '#94a3b8';
}

function getCategoryIcon(category) {
    const icons = { '数码产品': '📱', '家具家电': '📺', '交通工具': '🚗', '房产': '🏠', '投资理财产品': '💰', '其他': '📦' };
    return icons[category] || '📦';
}

function updateAssetList(status) {
    const filteredAssets = assets.filter(a => a.status === status);
    const list = document.getElementById('asset-list');
    if (filteredAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">暂无此类资产</div>';
        return;
    }
    list.innerHTML = filteredAssets.map(asset => {
        const days = calculateDays(asset.date);
        const dailyCost = days > 0 ? (asset.cost / days).toFixed(2) : '0.00';
        const tag = getStatusTag(asset.status);
        return `
            <div class="asset-item">
                <div class="asset-icon" style="background: ${getCategoryColor(asset.category)}20">${getCategoryIcon(asset.category)}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name} <span class="status-tag ${tag.class}">${tag.text}</span></div>
                    <div class="asset-detail">${asset.category} · 日均成本 ¥${dailyCost}</div>
                </div>
                <div class="asset-value">¥${formatMoney(asset.status === 'sold' ? asset.sellPrice : asset.value)}</div>
                <button class="delete-btn" onclick="deleteAsset(${asset.id})">🗑️</button>
            </div>
        `;
    }).join('');
}

function updateFlowCard() {
    const soldAssets = assets.filter(a => a.status === 'sold');
    const totalCost = soldAssets.reduce((sum, a) => sum + a.cost, 0);
    const totalRevenue = soldAssets.reduce((sum, a) => sum + (a.sellPrice || 0), 0);
    const profit = totalRevenue - totalCost;
    document.getElementById('sold-count').textContent = soldAssets.length;
    document.getElementById('sold-cost').textContent = formatMoney(totalCost);
    document.getElementById('sold-revenue').textContent = formatMoney(totalRevenue);
    const profitEl = document.getElementById('profit-total');
    profitEl.textContent = (profit >= 0 ? '+' : '') + '¥' + formatMoney(profit);
    profitEl.className = 'profit-value ' + (profit >= 0 ? 'profit-positive' : 'profit-negative');
    const list = document.getElementById('sold-list');
    if (soldAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">暂无卖出记录</div>';
        return;
    }
    list.innerHTML = soldAssets.map(asset => {
        const profit = (asset.sellPrice || 0) - asset.cost;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        return `
            <div class="asset-item">
                <div class="asset-icon" style="background: ${getCategoryColor(asset.category)}20">${getCategoryIcon(asset.category)}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-detail">购入 ¥${formatMoney(asset.cost)} · 卖出 ¥${formatMoney(asset.sellPrice)} · ${asset.sellDate}</div>
                </div>
                <div class="asset-value ${profitClass}">${profit >= 0 ? '+' : ''}¥${formatMoney(profit)}</div>
            </div>
        `;
    }).join('');
}

function showModal() {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('asset-name').value = '';
    document.getElementById('asset-cost').value = '';
    document.getElementById('asset-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('asset-value').value = '';
    document.getElementById('asset-status').value = 'active';
    document.getElementById('sell-date').value = '';
    document.getElementById('sell-price').value = '';
    document.getElementById('sell-date-group').style.display = 'none';
    document.getElementById('sell-price-group').style.display = 'none';
    document.getElementById('convert-asset-group').style.display = 'none';
    document.getElementById('asset-form').style.display = 'block';
}

function saveAsset() {
    const status = document.getElementById('asset-status').value;
    
    // 如果是退役状态，从服役中资产转换
    if (status === 'retired') {
        const convertAssetId = document.getElementById('convert-asset').value;
        if (!convertAssetId) {
            alert('请选择要退役的资产');
            return;
        }
        const asset = assets.find(a => a.id == convertAssetId);
        if (asset) {
            asset.status = 'retired';
            asset.value = parseFloat(document.getElementById('asset-value').value) || asset.value;
        }
    } else {
        // 原有逻辑：添加新资产
        const name = document.getElementById('asset-name').value;
        const category = document.getElementById('asset-category').value;
        const cost = parseFloat(document.getElementById('asset-cost').value) || 0;
        const date = document.getElementById('asset-date').value;
        const value = parseFloat(document.getElementById('asset-value').value) || 0;
        const sellDate = document.getElementById('sell-date').value;
        const sellPrice = parseFloat(document.getElementById('sell-price').value) || 0;
        if (!name || cost <= 0 || !date) {
            alert('请填写完整信息');
            return;
        }
        const newAsset = {
            id: Date.now(), name, category, cost, date,
            value: status === 'sold' ? 0 : value, status,
            sellDate: status === 'sold' ? sellDate : null,
            sellPrice: status === 'sold' ? sellPrice : null
        };
        assets.push(newAsset);
    }
    saveAssets();
    hideModal();
    refreshAll();
}

// 监听状态变化
function handleStatusChange() {
    const status = document.getElementById('asset-status').value;
    const activeAssets = assets.filter(a => a.status === 'active');
    
    if (status === 'retired' && activeAssets.length > 0) {
        // 显示选择服役中资产的下拉框
        document.getElementById('convert-asset-group').style.display = 'block';
        document.getElementById('asset-form').style.display = 'none';
        const select = document.getElementById('convert-asset');
        select.innerHTML = activeAssets.map(a => 
            `<option value="${a.id}">${a.name} (¥${formatMoney(a.value)})</option>`
        ).join('');
    } else {
        document.getElementById('convert-asset-group').style.display = 'none';
        document.getElementById('asset-form').style.display = 'block';
    }
    
    // 原有逻辑：控制卖出日期和价格显示
    document.getElementById('sell-date-group').style.display = status === 'sold' ? 'block' : 'none';
    document.getElementById('sell-price-group').style.display = status === 'sold' ? 'block' : 'none';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

function refreshAll() {
    updateOverview();
    updateCategoryChart();
    updateAssetList('active');
    updateFlowCard();
    animateCards();
}

// 卡片动画
function animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 数字滚动动画
function animateNumber(element, targetValue, duration = 1000) {
    const startValue = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easeOut;
        
        if (element.id === 'total-value' || element.id === 'avg-cost') {
            element.textContent = '¥' + currentValue.toFixed(2);
        } else if (element.id === 'appreciation-rate' || element.id === 'category-rate') {
            element.textContent = Math.round(currentValue) + '%';
        } else {
            element.textContent = Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    
    // 登录相关事件
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 资产相关事件
    document.getElementById('add-btn').addEventListener('click', showModal);
    document.getElementById('cancel-btn').addEventListener('click', hideModal);
    document.getElementById('save-btn').addEventListener('click', saveAsset);
    
    document.getElementById('asset-status').addEventListener('change', (e) => {
        const showSellFields = e.target.value === 'sold';
        document.getElementById('sell-date-group').style.display = showSellFields ? 'block' : 'none';
        document.getElementById('sell-price-group').style.display = showSellFields ? 'block' : 'none';
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateAssetList(tab.dataset.status);
        });
    });
    // 修复导航切换问题：切换时刷新数据
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const page = item.dataset.page;
            
            // 显示/隐藏对应卡片 - 总览页面只显示总览卡片
            document.getElementById('overview-card').style.display = page === 'overview' ? 'block' : 'none';
            document.getElementById('category-card').style.display = page === 'category' ? 'block' : 'none';
            document.getElementById('status-card').style.display = page === 'status' ? 'block' : 'none';
            document.getElementById('flow-card').style.display = page === 'flow' ? 'block' : 'none';
            
            // 修复：每次切换页面都刷新数据
            refreshAll();
        });
    });
    
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) hideModal();
    });
});

function deleteAsset(id) {
    if (confirm('确定要删除该资产吗？')) {
        assets = assets.filter(a => a.id !== id);
        saveAssets();
        refreshAll();
        updateOverviewAssetList();
    }
}