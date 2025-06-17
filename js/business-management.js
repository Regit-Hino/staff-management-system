// 業務管理JavaScript - 基本機能実装

// グローバル変数
let businessData = [];
let sectionData = [];
let timePlanData = [];
let currentTab = 'business';
let selectedColor = '#ff6b35';
let selectedSectionColor = '#ff6b35';
let editingBusinessId = null;
let editingSectionId = null;
let editingTimePlanId = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('業務管理画面初期化開始');
    
    // データを読み込み
    loadBusinessData();
    loadSectionData();
    loadTimePlanData();
    
    // イベントリスナー設定
    setupEventListeners();
    
    // タブ機能を初期化
    initializeTabs();
    
    // 初期表示
    renderCurrentTab();
    
    console.log('業務管理画面初期化完了');
});

// 業務データを読み込み
function loadBusinessData() {
    try {
        const data = localStorage.getItem('businessManagementData');
        if (data) {
            businessData = JSON.parse(data);
            console.log('業務データ読み込み完了:', businessData);
        } else {
            businessData = [];
            console.log('業務データが存在しないため、空配列で初期化');
        }
    } catch (error) {
        console.error('業務データ読み込みエラー:', error);
        businessData = [];
    }
}

// 業務データを保存
function saveBusinessData() {
    try {
        localStorage.setItem('businessManagementData', JSON.stringify(businessData));
        console.log('業務データ保存完了');
    } catch (error) {
        console.error('業務データ保存エラー:', error);
    }
}

// イベントリスナー設定
function setupEventListeners() {
    // モーダルイベント
    setupModalEvents();
}

// タブ機能を初期化
function initializeTabs() {
    // タブクリックイベント
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

// タブ切り替え
function switchTab(tabName) {
    console.log('タブ切り替え:', tabName);
    
    // 現在のタブを更新
    currentTab = tabName;
    
    // タブのアクティブ状態を更新
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // タブコンテンツのアクティブ状態を更新
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // タブ固有の内容を描画
    renderCurrentTab();
}

// モーダルイベント設定
function setupModalEvents() {
    const modal = document.getElementById('addBusinessModal');
    
    if (modal) {
        // 背景クリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddBusinessModal();
            }
        });
        
        // ×ボタンで閉じる
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeAddBusinessModal);
        }
    }
}

// 現在のタブを描画
function renderCurrentTab() {
    console.log('現在のタブを描画:', currentTab);
    
    switch (currentTab) {
        case 'business':
            renderBusinessTab();
            break;
        case 'section':
            renderSectionTab();
            break;
        case 'group':
            renderGroupTab();
            break;
        case 'pattern':
            renderPatternTab();
            break;
        case 'ng-pattern':
            renderNgPatternTab();
            break;
        case 'staff-assignment':
            renderStaffAssignmentTab();
            break;
        default:
            console.error('未知のタブ:', currentTab);
    }
}

// 各タブの描画関数
function renderBusinessTab() {
    console.log('業務タブ描画');
    
    const container = document.querySelector('#business-tab .tab-content-area');
    if (!container) {
        console.error('業務タブコンテナが見つかりません');
        return;
    }
    
    if (businessData.length === 0) {
        // 空の状態を表示
        container.innerHTML = `
            <div class="empty-state">
                <h3>業務がありません</h3>
                <p>上の作成ボタンから業務を作成してください。</p>
            </div>
        `;
    } else {
        // 業務一覧テーブルを表示
        renderBusinessTable(container);
    }
}

// 業務一覧テーブルを描画
function renderBusinessTable(container) {
    console.log('業務一覧テーブル描画');
    
    let html = `
        <table class="business-table">
            <thead>
                <tr>
                    <th>並替</th>
                    <th>編集</th>
                    <th>業務名</th>
                    <th>シフト</th>
                    <th>休憩時間</th>
                    <th>説明</th>
                    <th>時給</th>
                    <th>割り当て方法</th>
                    <th>種類</th>
                    <th>夜勤</th>
                    <th>次の日休み</th>
                    <th style="text-align: center;">シフト表に表示</th>
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th style="text-align: center;">
                        <div style="display: flex; justify-content: space-around; font-size: 11px;">
                            <span>カウント</span>
                            <span>割当</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody id="businessTableBody">
    `;
    
    businessData.forEach((business, index) => {
        const timeDisplay = business.startTime && business.endTime ? 
            `${business.startTime} - ${business.endTime}` : '';
        
        const breakTimeDisplay = business.breakTime || '0:00';
        const wageDisplay = business.hourlyWage ? `${business.hourlyWage}円` : '';
        const assignMethodDisplay = business.assignMethod === 'date' ? '曜日別' : 'スタッフごと';
        const shiftTypeDisplay = getShiftTypeDisplay(business.shiftType);
        
        html += `
            <tr draggable="true" data-business-id="${business.id}" class="business-row">
                <td style="text-align: center;">
                    <i class="fas fa-grip-vertical drag-handle" style="color: #6c757d; cursor: move;"></i>
                </td>
                <td>
                    <button class="btn-table btn-edit" onclick="openBusinessDetail('${business.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="business-color-indicator" style="background-color: ${business.color};"></div>
                        ${business.label}
                    </div>
                </td>
                <td>${timeDisplay}</td>
                <td>${breakTimeDisplay}</td>
                <td>${business.description || ''}</td>
                <td>${wageDisplay}</td>
                <td>${assignMethodDisplay}</td>
                <td>${shiftTypeDisplay}</td>
                <td style="text-align: center;">${business.nightShift ? '✓' : '×'}</td>
                <td style="text-align: center;">${business.nextDayOff ? '✓' : '×'}</td>
                <td style="text-align: center;">
                    <div style="display: flex; justify-content: space-around;">
                        <span>${business.showCount ? '✓' : '×'}</span>
                        <span>${business.showAssignment ? '✓' : '×'}</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    // ドラッグ&ドロップ機能を有効化
    setupBusinessTableDragAndDrop();
}

// シフト種類の表示名を取得
function getShiftTypeDisplay(shiftType) {
    const typeMap = {
        'normal': 'シフト',
        'paid-leave': '有休',
        'legal-holiday': '法定休日',
        'public': '公休',
        'half-day': '半有休',
        'non-legal-holiday': '法定外休日'
    };
    return typeMap[shiftType] || 'シフト';
}

function renderSectionTab() {
    console.log('セクションタブ描画');
    
    const container = document.querySelector('#section-tab .tab-content-area');
    if (!container) {
        console.error('セクションタブコンテナが見つかりません');
        return;
    }
    
    if (sectionData.length === 0) {
        // 空の状態を表示
        container.innerHTML = `
            <div class="empty-state">
                <h3>業務セクションがありません</h3>
                <p>上の作成ボタンから業務を作成してください。</p>
            </div>
        `;
    } else {
        // セクション一覧テーブルを表示
        renderSectionTable(container);
    }
}

function renderGroupTab() {
    console.log('グループタブ描画');
    // 現在は空の状態のみ表示
}

function renderPatternTab() {
    console.log('パターンタブ描画');
    // 現在は空の状態のみ表示
}

function renderNgPatternTab() {
    console.log('NGパターンタブ描画');
    // 現在は空の状態のみ表示
}

function renderStaffAssignmentTab() {
    console.log('配置スタッフ表タブ描画');
    // 現在は空の状態のみ表示
}

// 業務数を更新
function updateBusinessCount() {
    const countElement = document.querySelector('.business-count');
    if (countElement) {
        countElement.textContent = `${businessData.length}件`;
    }
}

// 空の状態を表示
function showEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-briefcase empty-icon"></i>
            <h3>業務がまだありません</h3>
            <p>新しい業務を追加して業務管理を開始しましょう</p>
            <button class="btn-primary" onclick="showAddBusinessModal()">
                <i class="fas fa-plus"></i>
                業務を追加
            </button>
        </div>
    `;
}

// 業務一覧を表示
function showBusinessList(container) {
    // 将来実装予定
    container.innerHTML = `
        <div class="business-table">
            <p>業務一覧表示機能は後で実装予定です。</p>
            <p>現在の業務数: ${businessData.length}件</p>
        </div>
    `;
}

// 作成モーダルを表示（各タブ用）
function showCreateModal(type) {
    console.log(`${type}作成モーダル表示`);
    
    switch (type) {
        case 'business':
            showBusinessCreateModal();
            break;
        case 'section':
            showSectionCreateModal();
            break;
        case 'group':
            console.log('グループ作成機能は後で実装予定です');
            break;
        case 'pattern':
            console.log('パターン作成機能は後で実装予定です');
            break;
        case 'ng-pattern':
            console.log('NGパターン作成機能は後で実装予定です');
            break;
        case 'staff-assignment':
            console.log('配置スタッフ表作成機能は後で実装予定です');
            break;
        default:
            console.error('未知の作成タイプ:', type);
    }
}

// 業務作成モーダルを表示
function showBusinessCreateModal() {
    console.log('業務作成モーダル表示');
    editingBusinessId = null;
    resetBusinessForm();
    
    const modal = document.getElementById('businessCreateModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 業務作成モーダルを閉じる
function closeBusinessCreateModal() {
    console.log('業務作成モーダル閉じる');
    const modal = document.getElementById('businessCreateModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 業務フォームをリセット
function resetBusinessForm() {
    selectedColor = '#ff6b35';
    document.getElementById('colorPreview').style.backgroundColor = selectedColor;
    document.getElementById('otherPeriodCheckbox').checked = false;
    document.getElementById('businessLabel').value = '';
    document.getElementById('businessDescription').value = '';
    document.getElementById('businessStartTime').value = '';
    document.getElementById('businessEndTime').value = '';
    document.getElementById('businessBreakTime').value = '';
    document.getElementById('businessHourlyWage').value = '';
    document.getElementById('nextDayOffCheckbox').checked = false;
    document.getElementById('nightShiftCheckbox').checked = false;
    document.getElementById('assignByDate').checked = true;
    document.getElementById('shiftTypeNormal').checked = true;
    document.getElementById('showCount').checked = true;
    document.getElementById('showAssignment').checked = true;
    document.getElementById('showShiftDetail').checked = false;
    document.getElementById('showNecessaryPeople').checked = false;
    document.getElementById('kotCode').value = '';
    document.getElementById('linkId').value = '';
}

// 色選択モーダルを表示
function showColorPicker() {
    console.log('色選択モーダル表示');
    const modal = document.getElementById('colorPickerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 色選択モーダルを閉じる
function closeColorPicker() {
    console.log('色選択モーダル閉じる');
    const modal = document.getElementById('colorPickerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 色を選択
function selectColor(color) {
    console.log('色選択:', color);
    selectedColor = color;
    document.getElementById('colorPreview').style.backgroundColor = color;
    closeColorPicker();
}

// 業務を保存
function saveBusiness() {
    console.log('業務保存開始');
    
    // フォームデータを収集
    const businessItem = {
        id: editingBusinessId || generateId(),
        color: selectedColor,
        otherPeriod: document.getElementById('otherPeriodCheckbox').checked,
        label: document.getElementById('businessLabel').value.trim(),
        description: document.getElementById('businessDescription').value.trim(),
        startTime: normalizeTime(document.getElementById('businessStartTime').value.trim()),
        endTime: normalizeTime(document.getElementById('businessEndTime').value.trim()),
        breakTime: normalizeTime(document.getElementById('businessBreakTime').value.trim()),
        hourlyWage: document.getElementById('businessHourlyWage').value.trim(),
        nextDayOff: document.getElementById('nextDayOffCheckbox').checked,
        nightShift: document.getElementById('nightShiftCheckbox').checked,
        assignMethod: document.querySelector('input[name="assignMethod"]:checked').value,
        shiftType: document.querySelector('input[name="shiftType"]:checked').value,
        showCount: document.getElementById('showCount').checked,
        showAssignment: document.getElementById('showAssignment').checked,
        showShiftDetail: document.getElementById('showShiftDetail').checked,
        showNecessaryPeople: document.getElementById('showNecessaryPeople').checked,
        kotCode: document.getElementById('kotCode').value.trim(),
        linkId: document.getElementById('linkId').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    // バリデーション
    if (!businessItem.label) {
        alert('業務名（ラベル）は必須です。');
        return;
    }
    
    console.log('業務データ:', businessItem);
    
    if (editingBusinessId) {
        // 編集の場合
        const index = businessData.findIndex(b => b.id === editingBusinessId);
        if (index !== -1) {
            businessData[index] = businessItem;
        }
    } else {
        // 新規作成の場合
        businessData.push(businessItem);
    }
    
    // データを保存
    saveBusinessData();
    
    // モーダルを閉じる
    closeBusinessCreateModal();
    
    // 業務タブを再描画
    renderBusinessTab();
    
    // 業務数を更新
    updateBusinessCount();
    
    console.log('業務保存完了');
}

// 時刻の正規化（シフト管理と同じ）
function normalizeTime(timeString) {
    if (!timeString) return '';
    
    const trimmed = timeString.trim();
    
    // 既に正しい形式の場合はそのまま返す
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(trimmed)) {
        return trimmed;
    }
    
    // 数字のみの場合（1 -> 1:00, 12 -> 12:00）
    if (/^\d{1,2}$/.test(trimmed)) {
        const hour = parseInt(trimmed);
        if (hour >= 0 && hour <= 23) {
            return `${hour}:00`;
        }
    }
    
    // 時:分の形式で分が一桁の場合（10:5 -> 10:05）
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
    if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return `${hour}:${minute.toString().padStart(2, '0')}`;
        }
    }
    
    return trimmed; // 変換できない場合は元の値を返す
}

// ID生成
function generateId() {
    return 'business_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 業務詳細を表示
function openBusinessDetail(businessId) {
    console.log('業務詳細表示:', businessId);
    
    const business = businessData.find(b => b.id === businessId);
    if (!business) {
        console.error('業務が見つかりません:', businessId);
        return;
    }
    
    // 詳細モーダルに情報を設定
    document.getElementById('businessDetailName').textContent = business.label;
    document.getElementById('detailBusinessName').textContent = business.label;
    document.getElementById('detailBusinessDescription').textContent = business.description || '';
    
    const timeDisplay = business.startTime && business.endTime ? 
        `${business.startTime} - ${business.endTime}` : '';
    document.getElementById('detailBusinessTime').textContent = timeDisplay;
    document.getElementById('detailBusinessBreak').textContent = business.breakTime || '0:00';
    
    // スタッフリストを生成
    renderAssignedStaffList();
    
    // モーダルを表示
    const modal = document.getElementById('businessDetailModal');
    if (modal) {
        modal.style.display = 'block';
        editingBusinessId = businessId;
    }
}

// 配置スタッフリストを描画
function renderAssignedStaffList() {
    const container = document.getElementById('assignedStaffList');
    if (!container) return;
    
    // スタッフ管理からスタッフデータを取得
    const staffData = getStaffDataFromStorage();
    
    let html = '';
    staffData.forEach(staff => {
        html += `
            <div class="staff-item">
                <input type="checkbox" id="staff_${staff.id}" class="staff-checkbox">
                <label for="staff_${staff.id}" class="staff-name">${staff.name}</label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// スタッフ管理からスタッフデータを取得
function getStaffDataFromStorage() {
    try {
        // スタッフ管理データを取得
        const staffManagementData = localStorage.getItem('staffManagementData');
        if (staffManagementData) {
            const staffList = JSON.parse(staffManagementData);
            return staffList.map(staff => ({
                id: staff.id,
                name: staff.name,
                role: staff.role
            }));
        }
        
        // allStaffDataからも確認
        const allStaffData = localStorage.getItem('allStaffData');
        if (allStaffData) {
            const allStaff = JSON.parse(allStaffData);
            return Object.values(allStaff).map(staff => ({
                id: staff.id,
                name: staff.name,
                role: staff.role
            }));
        }
        
        // デフォルトデータ
        return [
            { id: '1', name: '日野 真文', role: '管理者' },
            { id: '2', name: 'Regit 高木', role: 'スタッフ' },
            { id: '3', name: 'タロウ', role: 'スタッフ' },
            { id: '4', name: '一雄', role: 'スタッフ' },
            { id: '5', name: '上原', role: 'スタッフ' }
        ];
    } catch (error) {
        console.error('スタッフデータ取得エラー:', error);
        return [];
    }
}

// 業務詳細モーダルを閉じる
function closeBusinessDetail() {
    console.log('業務詳細モーダル閉じる');
    const modal = document.getElementById('businessDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingBusinessId = null;
}

// 業務詳細を保存
function saveBusinessDetail() {
    console.log('業務詳細保存開始');
    
    if (!editingBusinessId) {
        console.error('編集対象の業務IDが設定されていません');
        return;
    }
    
    const business = businessData.find(b => b.id === editingBusinessId);
    if (!business) {
        console.error('編集対象の業務が見つかりません');
        return;
    }
    
    // 必要人数の設定を収集
    const dayInputs = document.querySelectorAll('.day-input');
    const weeklyRequiredStaff = {};
    
    dayInputs.forEach((input, index) => {
        // 日曜日=0, 月曜日=1, ..., 土曜日=6
        weeklyRequiredStaff[index] = parseInt(input.value) || 0;
    });
    
    // 配置スタッフの設定を収集
    const assignedStaff = [];
    const staffCheckboxes = document.querySelectorAll('.staff-checkbox:checked');
    staffCheckboxes.forEach(checkbox => {
        const staffId = checkbox.id.replace('staff_', '');
        assignedStaff.push(staffId);
    });
    
    // 業務データを更新
    business.weeklyRequiredStaff = weeklyRequiredStaff;
    business.assignedStaff = assignedStaff;
    
    console.log('更新された業務データ:', business);
    
    // データを保存
    saveBusinessData();
    
    // モーダルを閉じる
    closeBusinessDetail();
    
    // 業務タブを再描画
    renderBusinessTab();
    
    console.log('業務詳細保存完了');
}

// 業務を編集
function editBusiness() {
    console.log('業務編集開始');
    
    if (!editingBusinessId) {
        console.error('編集対象の業務IDが設定されていません');
        return;
    }
    
    const business = businessData.find(b => b.id === editingBusinessId);
    if (!business) {
        console.error('編集対象の業務が見つかりません');
        return;
    }
    
    // 詳細モーダルを閉じて編集モーダルを開く
    closeBusinessDetail();
    
    // フォームに既存データを設定
    loadBusinessDataToForm(business);
    
    // 編集モーダルを表示
    showBusinessCreateModal();
}

// 業務データをフォームに読み込み
function loadBusinessDataToForm(business) {
    selectedColor = business.color || '#ff6b35';
    document.getElementById('colorPreview').style.backgroundColor = selectedColor;
    document.getElementById('otherPeriodCheckbox').checked = business.otherPeriod || false;
    document.getElementById('businessLabel').value = business.label || '';
    document.getElementById('businessDescription').value = business.description || '';
    document.getElementById('businessStartTime').value = business.startTime || '';
    document.getElementById('businessEndTime').value = business.endTime || '';
    document.getElementById('businessBreakTime').value = business.breakTime || '';
    document.getElementById('businessHourlyWage').value = business.hourlyWage || '';
    document.getElementById('nextDayOffCheckbox').checked = business.nextDayOff || false;
    document.getElementById('nightShiftCheckbox').checked = business.nightShift || false;
    
    // ラジオボタン
    const assignMethod = business.assignMethod || 'date';
    document.querySelector(`input[name="assignMethod"][value="${assignMethod}"]`).checked = true;
    
    const shiftType = business.shiftType || 'normal';
    document.querySelector(`input[name="shiftType"][value="${shiftType}"]`).checked = true;
    
    // チェックボックス
    document.getElementById('showCount').checked = business.showCount !== false;
    document.getElementById('showAssignment').checked = business.showAssignment !== false;
    document.getElementById('showShiftDetail').checked = business.showShiftDetail || false;
    document.getElementById('showNecessaryPeople').checked = business.showNecessaryPeople || false;
    
    document.getElementById('kotCode').value = business.kotCode || '';
    document.getElementById('linkId').value = business.linkId || '';
}

// 業務追加モーダルを表示（互換性のため残す）
function showAddBusinessModal() {
    showCreateModal('business');
}

// 業務追加モーダルを閉じる（互換性のため残す）
function closeAddBusinessModal() {
    console.log('業務追加モーダル閉じる');
}

// ドラッグ&ドロップ機能を設定
function setupBusinessTableDragAndDrop() {
    const tableBody = document.getElementById('businessTableBody');
    if (!tableBody) return;

    let draggedRow = null;
    let draggedIndex = null;

    // 各行にドラッグイベントを設定
    const rows = tableBody.querySelectorAll('.business-row');
    
    rows.forEach((row, index) => {
        // ドラッグ開始
        row.addEventListener('dragstart', function(e) {
            draggedRow = this;
            draggedIndex = index;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        });

        // ドラッグ終了
        row.addEventListener('dragend', function(e) {
            this.style.opacity = '';
            draggedRow = null;
            draggedIndex = null;
        });

        // ドラッグオーバー
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this !== draggedRow) {
                this.style.borderTop = '2px solid #007bff';
            }
        });

        // ドラッグ離脱
        row.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
        });

        // ドロップ
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderTop = '';
            
            if (this !== draggedRow && draggedRow) {
                const currentIndex = Array.from(tableBody.children).indexOf(this);
                
                // データ配列を更新
                const draggedItem = businessData[draggedIndex];
                businessData.splice(draggedIndex, 1);
                businessData.splice(currentIndex, 0, draggedItem);
                
                // データを保存
                saveBusinessData();
                
                // テーブルを再描画
                renderBusinessTab();
                
                console.log('業務順序変更完了');
            }
        });
    });
}

// セクションデータを読み込み
function loadSectionData() {
    try {
        const data = localStorage.getItem('sectionManagementData');
        if (data) {
            sectionData = JSON.parse(data);
            console.log('セクションデータ読み込み完了:', sectionData);
        } else {
            sectionData = [];
            console.log('セクションデータが存在しないため、空配列で初期化');
        }
    } catch (error) {
        console.error('セクションデータ読み込みエラー:', error);
        sectionData = [];
    }
}

// セクションデータを保存
function saveSectionData() {
    try {
        localStorage.setItem('sectionManagementData', JSON.stringify(sectionData));
        console.log('セクションデータ保存完了');
    } catch (error) {
        console.error('セクションデータ保存エラー:', error);
    }
}

// タイムプランデータを読み込み
function loadTimePlanData() {
    try {
        const data = localStorage.getItem('timePlanManagementData');
        if (data) {
            timePlanData = JSON.parse(data);
            console.log('タイムプランデータ読み込み完了:', timePlanData);
        } else {
            timePlanData = [];
            console.log('タイムプランデータが存在しないため、空配列で初期化');
        }
    } catch (error) {
        console.error('タイムプランデータ読み込みエラー:', error);
        timePlanData = [];
    }
}

// タイムプランデータを保存
function saveTimePlanData() {
    try {
        localStorage.setItem('timePlanManagementData', JSON.stringify(timePlanData));
        console.log('タイムプランデータ保存完了');
    } catch (error) {
        console.error('タイムプランデータ保存エラー:', error);
    }
}

// セクション一覧テーブルを描画
function renderSectionTable(container) {
    console.log('セクション一覧テーブル描画');
    
    let html = `
        <table class="section-table">
            <thead>
                <tr>
                    <th>編集</th>
                    <th>業務名</th>
                    <th>休憩</th>
                    <th>シフト表に表示</th>
                </tr>
            </thead>
            <tbody id="sectionTableBody">
    `;
    
    sectionData.forEach((section, index) => {
        const businessName = section.businessName || '';
        const holidayDisplay = section.holiday ? '✓' : '×';
        
        html += `
            <tr class="section-row" data-section-id="${section.id}">
                <td>
                    <button class="btn-table btn-edit" onclick="openSectionDetail('${section.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="section-color-indicator" style="background-color: ${section.color};"></div>
                        ${section.label}
                    </div>
                </td>
                <td style="text-align: center;">${holidayDisplay}</td>
                <td style="text-align: center;">${section.showCount ? '✓' : '×'}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// セクション作成モーダルを表示
function showSectionCreateModal() {
    console.log('セクション作成モーダル表示');
    editingSectionId = null;
    resetSectionForm();
    populateBusinessSelect();
    
    const modal = document.getElementById('sectionCreateModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// セクション作成モーダルを閉じる
function closeSectionCreateModal() {
    console.log('セクション作成モーダル閉じる');
    const modal = document.getElementById('sectionCreateModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// セクションフォームをリセット
function resetSectionForm() {
    selectedSectionColor = '#ff6b35';
    document.getElementById('sectionColorPreview').style.backgroundColor = selectedSectionColor;
    document.getElementById('sectionBusinessSelect').value = '';
    document.getElementById('sectionLabel').value = '';
    document.getElementById('sectionDescription').value = '';
    document.getElementById('sectionHoliday').checked = false;
    document.getElementById('sectionShowCount').checked = true;
}

// 業務選択セレクトボックスを更新
function populateBusinessSelect() {
    const select = document.getElementById('sectionBusinessSelect');
    if (!select) return;
    
    // 既存のオプションをクリア（最初のデフォルトオプション以外）
    select.innerHTML = '<option value="">業務名を選択</option>';
    
    // 業務データからオプションを追加
    businessData.forEach(business => {
        const option = document.createElement('option');
        option.value = business.id;
        option.textContent = business.label;
        select.appendChild(option);
    });
}

// セクション色選択モーダルを表示
function showSectionColorPicker() {
    console.log('セクション色選択モーダル表示');
    const modal = document.getElementById('colorPickerModal');
    if (modal) {
        modal.style.display = 'block';
        // 色選択時にセクション用の処理を行うフラグを設定
        modal.dataset.forSection = 'true';
    }
}

// セクションを保存
function saveSection() {
    console.log('セクション保存開始');
    
    // フォームデータを収集
    const sectionItem = {
        id: editingSectionId || generateId(),
        businessId: document.getElementById('sectionBusinessSelect').value,
        businessName: document.getElementById('sectionBusinessSelect').selectedOptions[0]?.textContent || '',
        color: selectedSectionColor,
        label: document.getElementById('sectionLabel').value.trim(),
        description: document.getElementById('sectionDescription').value.trim(),
        holiday: document.getElementById('sectionHoliday').checked,
        showCount: document.getElementById('sectionShowCount').checked,
        createdAt: new Date().toISOString()
    };
    
    // バリデーション
    if (!sectionItem.label) {
        alert('ラベルは必須です。');
        return;
    }
    
    console.log('セクションデータ:', sectionItem);
    
    if (editingSectionId) {
        // 編集の場合
        const index = sectionData.findIndex(s => s.id === editingSectionId);
        if (index !== -1) {
            sectionData[index] = sectionItem;
        }
    } else {
        // 新規作成の場合
        sectionData.push(sectionItem);
    }
    
    // データを保存
    saveSectionData();
    
    // モーダルを閉じる
    closeSectionCreateModal();
    
    // 成功モーダルを表示
    showSectionSuccessModal();
    
    console.log('セクション保存完了');
}

// セクション成功モーダルを表示
function showSectionSuccessModal() {
    console.log('セクション成功モーダル表示');
    const modal = document.getElementById('sectionSuccessModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// セクション成功モーダルを閉じる
function closeSectionSuccessModal() {
    console.log('セクション成功モーダル閉じる');
    const modal = document.getElementById('sectionSuccessModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // セクションタブを再描画
    renderSectionTab();
}

// セクション詳細を表示
function openSectionDetail(sectionId) {
    console.log('セクション詳細表示:', sectionId);
    
    const section = sectionData.find(s => s.id === sectionId);
    if (!section) {
        console.error('セクションが見つかりません:', sectionId);
        return;
    }
    
    // 詳細モーダルに情報を設定
    document.getElementById('sectionDetailName').textContent = section.label;
    document.getElementById('detailSectionName').textContent = section.label;
    document.getElementById('detailSectionDescription').textContent = section.description || '';
    
    // 詳細セクションの情報を設定
    document.getElementById('detailSectionLabel').textContent = section.label;
    document.getElementById('detailSectionDescText').textContent = section.description || '';
    document.getElementById('detailSectionHoliday').checked = section.holiday || false;
    document.getElementById('detailSectionShowCount').checked = section.showCount !== false;
    
    // スタッフリストを生成
    renderSectionStaffList();
    
    // タイムプランリストを生成
    renderTimePlanList();
    
    // タイムプラン配置カレンダーを生成
    renderTimePlanCalendar();
    
    // モーダルを表示
    const modal = document.getElementById('sectionDetailModal');
    if (modal) {
        modal.style.display = 'block';
        editingSectionId = sectionId;
    }
}

// セクション詳細モーダルを閉じる
function closeSectionDetail() {
    console.log('セクション詳細モーダル閉じる');
    const modal = document.getElementById('sectionDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingSectionId = null;
}

// セクションスタッフリストを描画
function renderSectionStaffList() {
    const container = document.getElementById('sectionStaffList');
    if (!container) return;
    
    // スタッフ管理からスタッフデータを取得
    const staffData = getStaffDataFromStorage();
    
    let html = '';
    staffData.forEach(staff => {
        html += `
            <div class="staff-item">
                <input type="checkbox" id="section_staff_${staff.id}" class="staff-checkbox">
                <label for="section_staff_${staff.id}" class="staff-name">${staff.name}</label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// タイムプラン配置カレンダーを描画
let currentCalendarDate = new Date();

function renderTimePlanCalendar() {
    renderCalendarHeader();
    renderMonthlyTimePlanCalendar();
    updateCalendarPeriod();
}

function renderCalendarHeader() {
    const container = document.getElementById('timePlanCalendarHeader');
    if (!container) return;
    
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    let html = '';
    
    dayNames.forEach((day, index) => {
        const dayClass = index === 0 ? 'sunday' : (index === 6 ? 'saturday' : '');
        html += `<div class="timeplan-calendar-day-header ${dayClass}">${day}</div>`;
    });
    
    container.innerHTML = html;
}

function renderMonthlyTimePlanCalendar() {
    const container = document.getElementById('timePlanCalendarBody');
    if (!container) return;
    
    if (timePlanData.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>タイムプランがありません。</p>
                <p>タイムプランセクションから作成してください。</p>
            </div>
        `;
        return;
    }
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 月の最初の日の曜日（0=日曜日）
    const startDay = firstDay.getDay();
    
    // 前月の日数
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // カレンダーに必要な週数を計算
    const totalCells = Math.ceil((lastDay.getDate() + startDay) / 7) * 7;
    const weeks = totalCells / 7;
    
    let html = '';
    let dayCount = 1;
    let nextMonthDay = 1;
    
    // 週ごとに描画
    for (let week = 0; week < weeks; week++) {
        html += '<div class="timeplan-calendar-week">';
        
        for (let day = 0; day < 7; day++) {
            const cellIndex = week * 7 + day;
            let dayNumber = '';
            let classes = ['timeplan-calendar-day'];
            let currentDate = null;
            
            if (cellIndex < startDay) {
                // 前月の日付
                dayNumber = prevMonthDays - startDay + cellIndex + 1;
                classes.push('other-month');
                currentDate = new Date(year, month - 1, dayNumber);
            } else if (dayCount <= lastDay.getDate()) {
                // 当月の日付
                dayNumber = dayCount;
                currentDate = new Date(year, month, dayNumber);
                
                // 曜日による色分け
                if (day === 0) classes.push('sunday');
                if (day === 6) classes.push('saturday');
                
                // 今日の日付をハイライト
                const today = new Date();
                if (dayCount === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    classes.push('today');
                }
                
                dayCount++;
            } else {
                // 翌月の日付
                dayNumber = nextMonthDay;
                classes.push('other-month');
                currentDate = new Date(year, month + 1, nextMonthDay);
                nextMonthDay++;
            }
            
            const dateStr = currentDate ? 
                `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}` : '';
            
            html += `
                <div class="${classes.join(' ')}" data-date="${dateStr}" onclick="showTimePlanSelectionModal('${dateStr}')">
                    <div class="timeplan-calendar-day-number">${dayNumber}</div>
                    <div class="timeplan-calendar-timeplans">
                        ${renderTimePlansForDay(dateStr)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function renderTimePlansForDay(dateStr) {
    let html = '';
    
    // 実際の配置データがある場合のみ表示（ランダム配置は削除）
    const assignedPlans = getAssignedTimePlans(dateStr);
    
    assignedPlans.forEach(planId => {
        const plan = timePlanData.find(tp => tp.id === planId);
        if (plan) {
            html += `
                <div class="timeplan-calendar-timeplan-item assigned" 
                     style="--timeplan-color: ${getTimePlanColor(plan.id)}"
                     onclick="showTimePlanRemoveModal('${plan.id}', '${dateStr}')"
                     title="${plan.title}"
                     data-plan-id="${plan.id}"
                     data-date="${dateStr}">
                    <span class="timeplan-item-text">${plan.title}</span>
                </div>
            `;
        }
    });
    
    return html;
}

// タイムプラン配置データを管理
let timePlanAssignments = {}; // { 'YYYY-MM-DD': ['planId1', 'planId2'] }

function getAssignedTimePlans(dateStr) {
    return timePlanAssignments[dateStr] || [];
}

function addTimePlanAssignment(planId, dateStr) {
    if (!timePlanAssignments[dateStr]) {
        timePlanAssignments[dateStr] = [];
    }
    if (!timePlanAssignments[dateStr].includes(planId)) {
        timePlanAssignments[dateStr].push(planId);
    }
}

function removeTimePlanAssignment(planId, dateStr) {
    if (timePlanAssignments[dateStr]) {
        timePlanAssignments[dateStr] = timePlanAssignments[dateStr].filter(id => id !== planId);
        if (timePlanAssignments[dateStr].length === 0) {
            delete timePlanAssignments[dateStr];
        }
    }
    renderTimePlanCalendar();
}

function getTimePlanColor(timePlanId) {
    // タイムプランごとに異なる色を返す
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#fd7e14'];
    const index = timePlanData.findIndex(tp => tp.id === timePlanId);
    return colors[index % colors.length];
}

function navigateCalendar(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderTimePlanCalendar();
}

function goToToday() {
    currentCalendarDate = new Date();
    renderTimePlanCalendar();
}

function updateCalendarPeriod() {
    const container = document.getElementById('calendarPeriod');
    if (!container) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    container.textContent = `${year}年${month + 1}月`;
}

// タイムプラン選択モーダルを表示
let selectedDateForTimePlan = null;

function showTimePlanSelectionModal(dateStr) {
    console.log('タイムプラン選択モーダル表示:', dateStr);
    
    // イベントバブリングを停止（タイムプランアイテムのクリックと区別）
    if (event && event.target.classList.contains('timeplan-calendar-timeplan-item')) {
        return;
    }
    
    selectedDateForTimePlan = dateStr;
    
    if (timePlanData.length === 0) {
        alert('タイムプランが作成されていません。まずタイムプランセクションからタイムプランを作成してください。');
        return;
    }
    
    const modal = document.getElementById('timePlanSelectionModal');
    if (modal) {
        renderTimePlanSelectionList();
        modal.style.display = 'block';
    }
}

function closeTimePlanSelectionModal() {
    const modal = document.getElementById('timePlanSelectionModal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedDateForTimePlan = null;
}

function renderTimePlanSelectionList() {
    const container = document.getElementById('timePlanSelectionList');
    if (!container || !selectedDateForTimePlan) return;
    
    const assignedPlans = getAssignedTimePlans(selectedDateForTimePlan);
    
    let html = '';
    timePlanData.forEach(plan => {
        const isAssigned = assignedPlans.includes(plan.id);
        const statusClass = isAssigned ? 'assigned' : 'unassigned';
        const statusText = isAssigned ? '配置済み' : '未配置';
        
        html += `
            <div class="timeplan-selection-item ${statusClass}" onclick="selectTimePlanForAssignment('${plan.id}')">
                <div class="timeplan-selection-info">
                    <div class="timeplan-selection-title">${plan.title}</div>
                    <div class="timeplan-selection-slots">
                        ${plan.slots.map(slot => `${slot.start}-${slot.end}: ${slot.count}人`).join(', ')}
                    </div>
                </div>
                <div class="timeplan-selection-status">${statusText}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function selectTimePlanForAssignment(planId) {
    if (!selectedDateForTimePlan) return;
    
    const assignedPlans = getAssignedTimePlans(selectedDateForTimePlan);
    
    if (assignedPlans.includes(planId)) {
        // 既に配置されている場合は削除
        removeTimePlanAssignment(planId, selectedDateForTimePlan);
        // モーダル内のリストを更新
        renderTimePlanSelectionList();
    } else {
        // 配置されていない場合は追加
        addTimePlanAssignment(planId, selectedDateForTimePlan);
        renderTimePlanCalendar();
        // モーダルを自動で閉じる
        closeTimePlanSelectionModal();
    }
}

// タイムプランモーダルを表示
function showTimePlanModal(timePlanId = null) {
    console.log('タイムプランモーダル表示:', timePlanId);
    editingTimePlanId = timePlanId;
    
    if (timePlanId) {
        // 編集モードの場合、既存データを読み込み
        const timePlan = timePlanData.find(tp => tp.id === timePlanId);
        if (timePlan) {
            loadTimePlanDataToForm(timePlan);
        }
    } else {
        // 新規作成モードの場合、フォームをリセット
        resetTimePlanForm();
    }
    
    const modal = document.getElementById('timePlanModal');
    if (modal) {
        modal.style.display = 'block';
        // モーダルタイトルを変更
        const title = modal.querySelector('.modal-title');
        if (title) {
            title.textContent = timePlanId ? 'タイムプラン編集' : '時間毎のタイムプラン';
        }
    }
}

// タイムプランモーダルを閉じる
function closeTimePlanModal() {
    console.log('タイムプランモーダル閉じる');
    const modal = document.getElementById('timePlanModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// タイムプランフォームをリセット
function resetTimePlanForm() {
    document.getElementById('timePlanTitle').value = '';
    
    // 最初のタイムスロットだけ残して他は削除
    const container = document.getElementById('timePlanSlots');
    const firstSlot = container.querySelector('.time-slot');
    container.innerHTML = '';
    container.appendChild(firstSlot);
    
    // 最初のスロットもリセット
    firstSlot.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
}

// タイムプランデータをフォームに読み込み
function loadTimePlanDataToForm(timePlan) {
    document.getElementById('timePlanTitle').value = timePlan.title;
    
    const container = document.getElementById('timePlanSlots');
    container.innerHTML = '';
    
    // 各スロットを追加
    timePlan.slots.forEach((slot, index) => {
        const newSlot = document.createElement('div');
        newSlot.className = 'time-slot';
        newSlot.innerHTML = `
            <div class="time-slot-header">
                <label>から</label>
                <label>まで</label>
                <label>必要人数</label>
            </div>
            <div class="time-slot-inputs">
                <input type="text" class="form-input time-input" placeholder="9:00" data-field="start" value="${slot.start}">
                <input type="text" class="form-input time-input" placeholder="10:00" data-field="end" value="${slot.end}">
                <input type="number" class="form-input number-input" placeholder="4" data-field="count" value="${slot.count}">
            </div>
        `;
        container.appendChild(newSlot);
    });
}

// タイムスロットを追加
function addTimeSlot() {
    console.log('タイムスロット追加');
    
    const container = document.getElementById('timePlanSlots');
    const newSlot = document.createElement('div');
    newSlot.className = 'time-slot';
    newSlot.innerHTML = `
        <div class="time-slot-header">
            <label>から</label>
            <label>まで</label>
            <label>必要人数</label>
        </div>
        <div class="time-slot-inputs">
            <input type="text" class="form-input time-input" placeholder="9:00" data-field="start">
            <input type="text" class="form-input time-input" placeholder="10:00" data-field="end">
            <input type="number" class="form-input number-input" placeholder="4" data-field="count">
        </div>
    `;
    
    container.appendChild(newSlot);
}

// タイムプランを保存
function saveTimePlan() {
    console.log('タイムプラン保存開始');
    
    const title = document.getElementById('timePlanTitle').value.trim();
    if (!title) {
        alert('タイトルは必須です。');
        return;
    }
    
    // 全タイムスロットのデータを収集
    const slots = [];
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach(slot => {
        const inputs = slot.querySelectorAll('input');
        const start = inputs[0].value.trim();
        const end = inputs[1].value.trim();
        const count = inputs[2].value.trim();
        
        if (start && end && count) {
            slots.push({
                start: normalizeTime(start),
                end: normalizeTime(end),
                count: parseInt(count)
            });
        }
    });
    
    if (slots.length === 0) {
        alert('少なくとも1つのタイムスロットを入力してください。');
        return;
    }
    
    const timePlanItem = {
        id: editingTimePlanId || generateId(),
        title: title,
        slots: slots,
        createdAt: new Date().toISOString()
    };
    
    console.log('タイムプランデータ:', timePlanItem);
    
    if (editingTimePlanId) {
        // 編集の場合
        const index = timePlanData.findIndex(tp => tp.id === editingTimePlanId);
        if (index !== -1) {
            timePlanData[index] = timePlanItem;
        }
    } else {
        // 新規作成の場合
        timePlanData.push(timePlanItem);
    }
    
    // データを保存
    saveTimePlanData();
    
    // モーダルを閉じる
    closeTimePlanModal();
    
    // タイムプランリストを更新
    renderTimePlanList();
    
    console.log('タイムプラン保存完了');
}

// タイムプランリストを描画
function renderTimePlanList() {
    const container = document.getElementById('timePlanList');
    if (!container) return;
    
    if (timePlanData.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>タイムプランがありません。</p>
                <p>上の作成ボタンから業務を作成してください。</p>
            </div>
        `;
    } else {
        let html = '<div class="time-plan-items">';
        timePlanData.forEach(plan => {
            html += `
                <div class="time-plan-item">
                    <div class="time-plan-header">
                        <h5>${plan.title}</h5>
                        <div class="time-plan-actions">
                            <button class="btn-icon" onclick="showTimePlanModal('${plan.id}')" title="編集">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteTimePlan('${plan.id}')" title="削除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="time-slots">
                        ${plan.slots.map(slot => 
                            `<span class="time-slot-display">${slot.start}-${slot.end}: ${slot.count}人</span>`
                        ).join(', ')}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }
}

// セクションを編集
function editSection() {
    console.log('セクション編集開始');
    
    if (!editingSectionId) {
        console.error('編集対象のセクションIDが設定されていません');
        return;
    }
    
    const section = sectionData.find(s => s.id === editingSectionId);
    if (!section) {
        console.error('編集対象のセクションが見つかりません');
        return;
    }
    
    // 詳細モーダルを閉じて編集モーダルを開く
    closeSectionDetail();
    
    // フォームに既存データを設定
    loadSectionDataToForm(section);
    
    // 編集モーダルを表示
    showSectionCreateModal();
}

// セクションデータをフォームに読み込み
function loadSectionDataToForm(section) {
    selectedSectionColor = section.color || '#ff6b35';
    document.getElementById('sectionColorPreview').style.backgroundColor = selectedSectionColor;
    document.getElementById('sectionBusinessSelect').value = section.businessId || '';
    document.getElementById('sectionLabel').value = section.label || '';
    document.getElementById('sectionDescription').value = section.description || '';
    document.getElementById('sectionHoliday').checked = section.holiday || false;
    document.getElementById('sectionShowCount').checked = section.showCount !== false;
}

// 色選択の拡張（業務とセクション両対応）
function selectColor(color) {
    console.log('色選択:', color);
    
    const modal = document.getElementById('colorPickerModal');
    const isForSection = modal && modal.dataset.forSection === 'true';
    
    if (isForSection) {
        selectedSectionColor = color;
        document.getElementById('sectionColorPreview').style.backgroundColor = color;
        modal.dataset.forSection = 'false';
    } else {
        selectedColor = color;
        document.getElementById('colorPreview').style.backgroundColor = color;
    }
    
    closeColorPicker();
}

// タイムプランを編集
function editTimePlan(timePlanId) {
    console.log('タイムプラン編集開始:', timePlanId);
    
    const timePlan = timePlanData.find(tp => tp.id === timePlanId);
    if (!timePlan) {
        console.error('タイムプランが見つかりません:', timePlanId);
        return;
    }
    
    editingTimePlanId = timePlanId;
    
    // フォームに既存データを設定
    loadTimePlanDataToForm(timePlan);
    
    // モーダルを表示
    showTimePlanModal();
}

// タイムプランデータをフォームに読み込み
function loadTimePlanDataToForm(timePlan) {
    // タイトルを設定
    document.getElementById('timePlanTitle').value = timePlan.title || '';
    
    // タイムスロットコンテナをクリア
    const container = document.getElementById('timePlanSlots');
    container.innerHTML = '';
    
    // 各スロットを追加
    timePlan.slots.forEach((slot, index) => {
        const newSlot = document.createElement('div');
        newSlot.className = 'time-slot';
        newSlot.innerHTML = `
            <div class="time-slot-header">
                <label>から</label>
                <label>まで</label>
                <label>必要人数</label>
            </div>
            <div class="time-slot-inputs">
                <input type="text" class="form-input time-input" placeholder="9:00" data-field="start" value="${slot.start}">
                <input type="text" class="form-input time-input" placeholder="10:00" data-field="end" value="${slot.end}">
                <input type="number" class="form-input number-input" placeholder="4" data-field="count" value="${slot.count}">
            </div>
        `;
        container.appendChild(newSlot);
    });
}

// タイムプランを削除
function deleteTimePlan(timePlanId) {
    console.log('タイムプラン削除:', timePlanId);
    
    if (!confirm('このタイムプランを削除してもよろしいですか？')) {
        return;
    }
    
    // データから削除
    const index = timePlanData.findIndex(tp => tp.id === timePlanId);
    if (index !== -1) {
        timePlanData.splice(index, 1);
        
        // データを保存
        saveTimePlanData();
        
        // リストを再描画
        renderTimePlanList();
        
        console.log('タイムプラン削除完了');
    }
}

// タイムプラン削除確認モーダル関連
let pendingRemovalPlanId = null;
let pendingRemovalDate = null;

function showTimePlanRemoveModal(planId, dateStr) {
    console.log('タイムプラン削除確認モーダル表示:', planId, dateStr);
    
    const plan = timePlanData.find(tp => tp.id === planId);
    if (!plan) return;
    
    pendingRemovalPlanId = planId;
    pendingRemovalDate = dateStr;
    
    // モーダルに情報を設定
    document.getElementById('timePlanRemoveTitle').textContent = plan.title;
    document.getElementById('timePlanRemoveDate').textContent = formatDateForDisplay(dateStr);
    
    const modal = document.getElementById('timePlanRemoveModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeTimePlanRemoveModal() {
    const modal = document.getElementById('timePlanRemoveModal');
    if (modal) {
        modal.style.display = 'none';
    }
    pendingRemovalPlanId = null;
    pendingRemovalDate = null;
}

function confirmTimePlanRemoval() {
    if (pendingRemovalPlanId && pendingRemovalDate) {
        removeTimePlanAssignment(pendingRemovalPlanId, pendingRemovalDate);
        closeTimePlanRemoveModal();
    }
}

function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}


// グローバル関数として公開
window.showCreateModal = showCreateModal;
window.showAddBusinessModal = showAddBusinessModal;
window.closeAddBusinessModal = closeAddBusinessModal;
window.saveBusinessDetail = saveBusinessDetail;
window.editTimePlan = editTimePlan;
window.deleteTimePlan = deleteTimePlan;
window.showTimePlanRemoveModal = showTimePlanRemoveModal;
window.closeTimePlanRemoveModal = closeTimePlanRemoveModal;
window.confirmTimePlanRemoval = confirmTimePlanRemoval;