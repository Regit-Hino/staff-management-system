// 業務管理JavaScript - 基本機能実装

// グローバル変数
let businessData = [];
let currentTab = 'business';
let selectedColor = '#ff6b35';
let editingBusinessId = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('業務管理画面初期化開始');
    
    // データを読み込み
    loadBusinessData();
    
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
    // 現在は空の状態のみ表示
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
            console.log('セクション作成機能は後で実装予定です');
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

// グローバル関数として公開
window.showCreateModal = showCreateModal;
window.showAddBusinessModal = showAddBusinessModal;
window.closeAddBusinessModal = closeAddBusinessModal;