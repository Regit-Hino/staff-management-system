// スタッフ管理システム - JavaScript

// グローバル変数
let draggedRow = null;
let addDropdownVisible = false;
let currentActionRow = null;
let actionMenuVisible = false;

// ドラッグ&ドロップ機能
function initializeDragAndDrop() {
    document.querySelectorAll('tbody tr').forEach(row => {
        row.draggable = true;
        addDragEvents(row);
    });
}

// ドラッグイベントを行に追加
function addDragEvents(row) {
    row.addEventListener('dragstart', function(e) {
        draggedRow = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    });
    
    row.addEventListener('dragend', function(e) {
        this.style.opacity = '';
        draggedRow = null;
    });
    
    row.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.style.borderTop = '2px solid #007bff';
    });
    
    row.addEventListener('dragleave', function(e) {
        this.style.borderTop = '';
    });
    
    row.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderTop = '';
        
        if (draggedRow !== this) {
            const tbody = this.parentNode;
            const draggedIndex = Array.from(tbody.children).indexOf(draggedRow);
            const targetIndex = Array.from(tbody.children).indexOf(this);
            
            if (draggedIndex < targetIndex) {
                tbody.insertBefore(draggedRow, this.nextSibling);
            } else {
                tbody.insertBefore(draggedRow, this);
            }
            
            // ドラッグ&ドロップ後にデータ保存
            saveStaffData();
        }
    });
}

// 権限変更イベント（権限は編集画面でのみ変更可能のため無効化）
function initializeRoleSelectEvents() {
    // 権限は表示のみのため、イベントリスナーは設定しない
    console.log('Role selects disabled - use edit screen to change roles');
}

// 追加ドロップダウンを隠す
function hideAddDropdown() {
    const dropdown = document.getElementById('addDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        addDropdownVisible = false;
    }
}

// 招待カードイベント
function initializeInviteCards() {
    document.querySelectorAll('.invite-card').forEach(card => {
        card.addEventListener('click', function() {
            const label = this.querySelector('.invite-label').textContent.trim();
            
            // モーダルマッピング
            const modalMap = {
                'スタッフ登録': 'staffRegisterModal',
                '仮スタッフ登録': 'tempStaffRegisterModal', 
                'リンク': 'linkModal',
                'QRコード': 'qrModal',
                'CSVインポート': 'csvModal',
                'SMS': 'smsModal',
                'OCRダウンロード': 'ocrModal'
            };
            
            const modalId = modalMap[label];
            if (modalId) {
                showModal(modalId);
            }
        });
    });
}

// モーダル表示関数
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// モーダル非表示関数
function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// モーダル関連イベント
function initializeModalEvents() {
    // モーダル閉じるボタン
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            hideModal(this.closest('.modal'));
        });
    });
    
    // モーダル背景クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this);
            }
        });
    });
}

// コピー機能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('URLをコピーしました');
    });
}

// CSV ドラッグ&ドロップ
function initializeCSVUpload() {
    const csvUploadArea = document.getElementById('csvUploadArea');
    if (csvUploadArea) {
        csvUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            csvUploadArea.classList.add('dragover');
        });
        
        csvUploadArea.addEventListener('dragleave', () => {
            csvUploadArea.classList.remove('dragover');
        });
        
        csvUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            csvUploadArea.classList.remove('dragover');
            alert('CSVファイルを受け取りました');
        });
    }
}

// スタッフデータ管理
function saveStaffData() {
    const staffList = [];
    document.querySelectorAll('tbody tr').forEach((row, index) => {
        const staffData = {
            id: row.dataset.staffId || index.toString(),
            name: row.querySelector('.staff-name').textContent,
            furigana: row.querySelector('.staff-memo').textContent,
            email: '',
            phone: '',
            isTemp: false,
            role: row.querySelector('.role-display').textContent,
            employeeId: row.cells[3].textContent === '−' ? '' : row.cells[3].textContent,
            tag: row.cells[4].textContent === '−' ? '' : row.cells[4].textContent,
            hourlyWage: row.cells[5].textContent.replace('円', '') || '0',
            transport: row.cells[6].textContent.replace('円', '') || '0',
            maxMonthly: row.cells[7].textContent === '無' ? '0' : row.cells[7].textContent
        };
        
        // 連絡先情報の取得
        const contactCell = row.cells[8];
        if (contactCell.innerHTML.includes('@')) {
            const lines = contactCell.innerHTML.split('<br>');
            staffData.email = lines[0] || '';
            staffData.phone = lines[1] || '';
        } else if (!contactCell.innerHTML.includes('empty-field')) {
            staffData.email = contactCell.textContent.trim();
        } else {
            staffData.isTemp = true;
        }
        
        staffList.push(staffData);
    });
    
    console.log('Saving staff data:', staffList);
    localStorage.setItem('staffManagementData', JSON.stringify(staffList));
}

function loadStaffData() {
    const savedData = localStorage.getItem('staffManagementData');
    console.log('Loading staff data:', savedData);
    
    if (savedData) {
        const staffList = JSON.parse(savedData);
        console.log('Parsed staff list:', staffList);
        
        const tbody = document.querySelector('tbody');
        
        // 既存の全ての行をクリア
        tbody.innerHTML = '';
        
        // 保存されたスタッフデータを全て表示
        staffList.forEach((staffData, index) => {
            updateStaffRowInTable(staffData, index);
        });
        
        updateStaffCount();
        
        console.log('Staff data loaded, rows created');
    } else {
        console.log('No saved data found');
    }
}

// テーブル内のスタッフ行を更新
function updateStaffRowInTable(staffData, index) {
    const tbody = document.querySelector('tbody');
    let row = tbody.children[index];
    
    // 行が存在しない場合は新しく作成
    if (!row) {
        row = document.createElement('tr');
        row.draggable = true;
        row.dataset.staffId = staffData.id || index.toString();
        addDragEvents(row);
        tbody.appendChild(row);
    }
    
    // 連絡先情報の作成
    const contactInfo = staffData.isTemp || (!staffData.email && !staffData.phone) ? 
        '<span class="empty-field">−</span>' : 
        `${staffData.email || ''}<br>${staffData.phone || ''}`.replace('<br>', staffData.email && staffData.phone ? '<br>' : '');
    
    // 行の内容を更新
    row.innerHTML = `
        <td>
            <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
        </td>
        <td>
            <div class="staff-name">${staffData.name}</div>
            <div class="staff-memo">${staffData.furigana}</div>
        </td>
        <td class="empty-field">−</td>
        <td class="empty-field">${staffData.employeeId || '−'}</td>
        <td class="empty-field">${staffData.tag || '−'}</td>
        <td class="currency">${staffData.hourlyWage || 0}円</td>
        <td class="currency">${staffData.transport || 0}円</td>
        <td>${staffData.maxMonthly || '無'}</td>
        <td>${contactInfo}</td>
        <td>
            <span class="role-display">${staffData.role || 'スタッフ'}</span>
        </td>
        <td><span class="shift-check">✓</span></td>
        <td>
            <div class="actions">
                <i class="fas fa-ellipsis-v"></i>
            </div>
        </td>
    `;
    
    // 権限は表示のみのため、イベントリスナー不要
    
    // アクションメニューイベントは後で一括設定するため、ここでは設定しない
}

// スタッフ登録機能
function registerStaff(isTemp) {
    const modalId = isTemp ? 'tempStaffRegisterModal' : 'staffRegisterModal';
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    
    // フォームデータ取得
    const name = form.querySelector('input[placeholder*="太郎"]').value;
    const furigana = form.querySelector('input[placeholder*="たろう"], input[placeholder="仮"]').value;
    const email = isTemp ? '' : (form.querySelector('input[type="email"]')?.value || '');
    const phone = isTemp ? '' : (form.querySelector('input[type="tel"]')?.value || '');
    
    // バリデーション
    if (!name || !furigana) {
        alert('名前とふりがなを入力してください。');
        return;
    }
    
    if (!isTemp && (!email || !phone)) {
        alert('全ての項目を入力してください。');
        return;
    }
    
    // スタッフ追加
    addStaffToTable({
        id: Date.now() + Math.random(),
        name: name,
        furigana: furigana,
        email: email,
        phone: phone,
        isTemp: isTemp,
        role: 'スタッフ'
    });
    
    // フォームリセット
    form.reset();
    
    // モーダル閉じる
    hideModal(modal);
    
    // スタッフ数更新
    updateStaffCount();
    
    // データ保存
    saveStaffData();
}

// スタッフテーブルに追加
function addStaffToTable(staffData, shouldSave = true) {
    const tbody = document.querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.draggable = true;
    newRow.dataset.staffId = staffData.id || Date.now() + Math.random();
    
    // ドラッグ&ドロップイベント追加
    addDragEvents(newRow);
    
    const contactInfo = staffData.isTemp ? 
        '<span class="empty-field">−</span>' : 
        `${staffData.email}<br>${staffData.phone}`;
    
    newRow.innerHTML = `
        <td>
            <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
        </td>
        <td>
            <div class="staff-name">${staffData.name}</div>
            <div class="staff-memo">${staffData.furigana}</div>
        </td>
        <td class="empty-field">−</td>
        <td class="empty-field">−</td>
        <td class="empty-field">−</td>
        <td class="currency">0円</td>
        <td class="currency">0円</td>
        <td>無</td>
        <td>${contactInfo}</td>
        <td>
            <span class="role-display">${staffData.role || 'スタッフ'}</span>
        </td>
        <td><span class="shift-check">✓</span></td>
        <td>
            <div class="actions">
                <i class="fas fa-ellipsis-v"></i>
            </div>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // 権限は表示のみのため、イベントリスナー不要
    
    // アクションメニューイベントはイベント委譲で処理するため、ここでは設定しない
}

// スタッフ数更新
function updateStaffCount() {
    const staffCount = document.querySelectorAll('tbody tr').length;
    document.querySelector('.staff-count').textContent = `${staffCount}名`;
}

// アクションメニュー関連
function initializeActionMenu() {
    // 編集ボタンのイベントリスナー（一度だけ設定）
    const editBtn = document.getElementById('editStaffBtn');
    if (editBtn && !editBtn.hasAttribute('data-listener-added')) {
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Edit button clicked, currentActionRow:', currentActionRow);
            editStaff();
        });
        editBtn.setAttribute('data-listener-added', 'true');
    }
    
    // 削除ボタンのイベントリスナー（一度だけ設定）
    const deleteBtn = document.getElementById('deleteStaffBtn');
    if (deleteBtn && !deleteBtn.hasAttribute('data-listener-added')) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteStaff();
        });
        deleteBtn.setAttribute('data-listener-added', 'true');
    }
    
    // クリック外でメニューを閉じる（一度だけ設定）
    if (!document.body.hasAttribute('data-action-menu-listener')) {
        document.addEventListener('click', function(e) {
            if (actionMenuVisible && !e.target.closest('#actionMenu') && !e.target.closest('.action-menu-item') && !e.target.closest('.actions')) {
                hideActionMenu();
            }
        });
        document.body.setAttribute('data-action-menu-listener', 'true');
    }
}

// イベント委譲を使用した3点リーダーボタンの管理
function initializeAllActionButtons() {
    // 既存のイベントリスナーを削除
    const tbody = document.querySelector('tbody');
    
    // tbody上でイベント委譲を使用
    tbody.removeEventListener('click', handleActionClick);
    tbody.addEventListener('click', handleActionClick);
    
    console.log('Action buttons initialized with event delegation');
}

// アクションボタンクリックハンドラー
function handleActionClick(e) {
    const actionButton = e.target.closest('.actions');
    const staffName = e.target.closest('.staff-name');
    
    // スタッフ名がクリックされた場合
    if (staffName) {
        e.stopPropagation();
        const row = staffName.closest('tr');
        currentActionRow = row;
        
        console.log('Staff name clicked, opening edit screen for:', staffName.textContent);
        editStaff();
        return;
    }
    
    // 3点リーダーがクリックされた場合
    if (!actionButton) return;
    
    e.stopPropagation();
    
    const menu = document.getElementById('actionMenu');
    currentActionRow = actionButton.closest('tr');
    
    console.log('Action button clicked via delegation, setting currentActionRow:', currentActionRow);
    console.log('Action row details:', {
        name: currentActionRow?.querySelector('.staff-name')?.textContent,
        id: currentActionRow?.dataset?.staffId
    });
    
    if (actionMenuVisible) {
        hideActionMenu();
        return;
    }
    
    // メニュー位置計算
    const rect = actionButton.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.left = (rect.left - menu.offsetWidth + 20) + 'px';
    menu.style.top = (rect.bottom + 5) + 'px';
    
    actionMenuVisible = true;
}

// アクションメニューを隠す
function hideActionMenu() {
    const menu = document.getElementById('actionMenu');
    menu.style.display = 'none';
    actionMenuVisible = false;
    currentActionRow = null;
}

// スタッフ編集
function editStaff() {
    console.log('editStaff function called');
    console.log('currentActionRow:', currentActionRow);
    
    if (!currentActionRow) {
        console.error('currentActionRow is null');
        return;
    }
    
    try {
        // 現在のスタッフデータを取得
        const staffName = currentActionRow.querySelector('.staff-name').textContent;
        const staffFurigana = currentActionRow.querySelector('.staff-memo').textContent;
        const contactCell = currentActionRow.cells[8];
        const role = currentActionRow.querySelector('.role-display').textContent;
        
        console.log('Staff data:', { staffName, staffFurigana, role });
        
        // スタッフデータを作成
        const staffData = {
            name: staffName,
            furigana: staffFurigana,
            role: role,
            email: '',
            phone: ''
        };
        
        // 連絡先情報の設定
        if (contactCell.innerHTML.includes('@')) {
            const lines = contactCell.innerHTML.split('<br>');
            staffData.email = lines[0] || '';
            staffData.phone = lines[1] || '';
        }
        
        // スタッフIDを生成（行のインデックスを使用）
        const staffRows = Array.from(document.querySelectorAll('tbody tr'));
        const staffId = staffRows.indexOf(currentActionRow).toString();
        
        console.log('Generated staffId:', staffId);
        
        // 編集用データを保存
        let allStaffData = JSON.parse(localStorage.getItem('allStaffData') || '{}');
        allStaffData[staffId] = {
            ...staffData,
            id: staffId
        };
        localStorage.setItem('allStaffData', JSON.stringify(allStaffData));
        
        // 編集中のスタッフIDを保存
        sessionStorage.setItem('editingStaffId', staffId);
        
        console.log('Data saved, navigating to staff-edit.html');
        
        // 編集画面に遷移（複数の方法で確実に）
        try {
            window.location.assign('staff-edit.html');
        } catch (navError) {
            console.error('Navigation error:', navError);
            // フォールバックとして現在のページで編集画面を表示
            window.location.replace('staff-edit.html');
        }
        
        // メニューを隠す（遷移後なので実際は実行されない）
        hideActionMenu();
        
    } catch (error) {
        console.error('Error in editStaff function:', error);
        alert('編集画面の表示中にエラーが発生しました: ' + error.message);
    }
}

// スタッフ削除
function deleteStaff() {
    if (!currentActionRow) return;
    
    const staffName = currentActionRow.querySelector('.staff-name').textContent;
    if (confirm(`「${staffName}」を削除しますか？この操作は取り消せません。`)) {
        currentActionRow.remove();
        updateStaffCount();
        saveStaffData();
    }
    
    hideActionMenu();
}

// スタッフ編集保存
function saveStaffEdit() {
    if (!currentActionRow) return;
    
    // フォームデータ取得
    const name = document.getElementById('edit-name').value;
    const furigana = document.getElementById('edit-furigana').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const role = document.getElementById('edit-role').value;
    
    // バリデーション
    if (!name || !furigana) {
        alert('名前とふりがなは必須です。');
        return;
    }
    
    // スタッフ情報更新
    currentActionRow.querySelector('.staff-name').textContent = name;
    currentActionRow.querySelector('.staff-memo').textContent = furigana;
    currentActionRow.querySelector('.role-display').textContent = role;
    
    // 連絡先更新
    const contactCell = currentActionRow.cells[8];
    if (email && phone) {
        contactCell.innerHTML = `${email}<br>${phone}`;
    } else if (email) {
        contactCell.innerHTML = email;
    } else {
        contactCell.innerHTML = '<span class="empty-field">−</span>';
    }
    
    // データ保存
    saveStaffData();
    
    // モーダル閉じる
    hideModal(document.getElementById('staffEditModal'));
    
    alert('スタッフ情報を更新しました。');
}

// 追加ボタン関連
function initializeAddButton() {
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = document.getElementById('addDropdown');
            if (!dropdown) return;
            
            if (addDropdownVisible) {
                hideAddDropdown();
            } else {
                dropdown.style.display = 'block';
                addDropdownVisible = true;
            }
        });
    }
    
    // 追加ドロップダウンアイテムのイベントリスナーを設定
    document.querySelectorAll('.add-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            hideAddDropdown();
            showModal(modalId);
        });
    });
    
    // クリック外で追加ドロップダウンを閉じる
    document.addEventListener('click', function(e) {
        if (addDropdownVisible && !e.target.closest('.header-actions') && !e.target.closest('#addDropdown')) {
            hideAddDropdown();
        }
    });
}

// デバッグ用：3点リーダーの動作確認
function testActionButtons() {
    console.log('=== Action Buttons Test ===');
    const actions = document.querySelectorAll('.actions');
    console.log('Total action buttons found:', actions.length);
    
    actions.forEach((action, index) => {
        console.log(`Button ${index}:`, {
            element: action,
            hasIcon: !!action.querySelector('i'),
            parentRow: action.closest('tr'),
            staffName: action.closest('tr')?.querySelector('.staff-name')?.textContent
        });
        
        // 手動テスト用のクリックリスナーを追加
        action.addEventListener('click', function() {
            console.log(`Manual test: Button ${index} clicked!`);
        });
    });
    
    const menu = document.getElementById('actionMenu');
    console.log('Action menu element:', menu);
    console.log('Edit button:', document.getElementById('editStaffBtn'));
    console.log('Delete button:', document.getElementById('deleteStaffBtn'));
    
    // 手動でイベント委譲をテスト
    console.log('Testing event delegation...');
    const tbody = document.querySelector('tbody');
    if (tbody) {
        console.log('tbody found, event delegation should work');
    } else {
        console.error('tbody not found!');
    }
}

// 初期化関数
function initializeStaffManagement() {
    console.log('=== Starting Staff Management Initialization ===');
    
    // まずイベント委譲を設定
    initializeAllActionButtons();
    
    loadStaffData();
    initializeDragAndDrop();
    initializeRoleSelectEvents();
    initializeInviteCards();
    initializeModalEvents();
    initializeCSVUpload();
    initializeActionMenu();
    initializeAddButton();
    
    // 初期化完了後にテスト実行
    setTimeout(() => {
        console.log('=== Running post-initialization test ===');
        testActionButtons();
    }, 200);
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initializeStaffManagement);