// スタッフ編集画面専用JavaScript

// 編集画面のデータ保存
function saveStaffEdit() {
    // フォームデータ取得
    const staffData = {
        name: document.getElementById('edit-name').value,
        furigana: document.getElementById('edit-furigana').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        connectionId: document.getElementById('edit-connection-id').value,
        memo: document.getElementById('edit-memo').value,
        employeeId: document.getElementById('edit-employee-id').value,
        hourlyWage: document.getElementById('edit-hourly-wage').value,
        transport: document.getElementById('edit-transport').value,
        maxMonthly: document.getElementById('edit-max-monthly').value,
        monthlyBreak: document.getElementById('edit-monthly-break').value,
        weekMin: document.getElementById('edit-week-min').value,
        weekMax: document.getElementById('edit-week-max').value,
        monthMin: document.getElementById('edit-month-min').value,
        monthMax: document.getElementById('edit-month-max').value,
        joinYear: document.getElementById('edit-join-year').value,
        joinMonth: document.getElementById('edit-join-month').value,
        joinDay: document.getElementById('edit-join-day').value,
        weeklyDays: document.getElementById('edit-weekly-days').value,
        role: document.getElementById('edit-role').value,
        tag: document.getElementById('edit-tag').value,
        applyAll: document.getElementById('edit-apply-all').checked
    };
    
    // バリデーション
    if (!staffData.name || !staffData.furigana) {
        alert('名前とふりがなは必須です。');
        return;
    }
    
    if (!staffData.email) {
        alert('電子メールは必須です。');
        return;
    }
    
    // 時間形式のバリデーション
    const timeFields = [staffData.weekMin, staffData.weekMax, staffData.monthMin, staffData.monthMax];
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    for (let timeField of timeFields) {
        if (timeField && !timePattern.test(timeField)) {
            alert('時間は HH:MM 形式で入力してください。');
            return;
        }
    }
    
    // 入社日のバリデーション
    if (staffData.joinYear || staffData.joinMonth || staffData.joinDay) {
        if (!staffData.joinYear || !staffData.joinMonth || !staffData.joinDay) {
            alert('入社日は年月日すべて入力してください。');
            return;
        }
        
        const year = parseInt(staffData.joinYear);
        const month = parseInt(staffData.joinMonth);
        const day = parseInt(staffData.joinDay);
        
        if (year < 1900 || year > 2100) {
            alert('年は1900-2100の範囲で入力してください。');
            return;
        }
        
        if (month < 1 || month > 12) {
            alert('月は1-12の範囲で入力してください。');
            return;
        }
        
        if (day < 1 || day > 31) {
            alert('日は1-31の範囲で入力してください。');
            return;
        }
        
        // 日付の妥当性チェック
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            alert('正しい日付を入力してください。');
            return;
        }
    }
    
    // データ保存処理（localStorage）
    try {
        // 現在編集中のスタッフIDを取得（仮想的に最初のスタッフとする）
        const currentStaffId = sessionStorage.getItem('editingStaffId') || '1';
        
        // 既存のスタッフデータを取得
        let allStaffData = JSON.parse(localStorage.getItem('allStaffData') || '{}');
        
        // 編集したスタッフデータを更新
        allStaffData[currentStaffId] = {
            ...staffData,
            id: currentStaffId,
            lastModified: new Date().toISOString()
        };
        
        // localStorage に保存
        localStorage.setItem('allStaffData', JSON.stringify(allStaffData));
        
        // スタッフ一覧のデータも更新
        updateStaffListData(currentStaffId, staffData);
        
        // 成功メッセージ
        alert('スタッフ情報を保存しました。');
        
        // 一覧画面に戻る
        goBackToStaffList();
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存中にエラーが発生しました。');
    }
}

// スタッフ一覧のデータを更新
function updateStaffListData(staffId, staffData) {
    try {
        // 既存のスタッフ管理データを取得
        let staffManagementData = JSON.parse(localStorage.getItem('staffManagementData') || '[]');
        
        console.log('Current staffManagementData:', staffManagementData);
        console.log('Updating staffId:', staffId, 'with data:', staffData);
        
        // 該当スタッフのデータを更新
        const staffIndex = parseInt(staffId);
        
        // スタッフ管理データが空の場合、初期データを作成
        if (staffManagementData.length === 0) {
            // 現在の表示されているスタッフデータを取得してベースデータを作成
            staffManagementData = createInitialStaffData();
        }
        
        if (staffIndex >= 0 && staffIndex < staffManagementData.length) {
            // 既存データを更新
            staffManagementData[staffIndex] = {
                ...staffManagementData[staffIndex],
                id: staffData.id || staffManagementData[staffIndex].id,
                name: staffData.name,
                furigana: staffData.furigana,
                email: staffData.email,
                phone: staffData.phone,
                role: staffData.role || 'スタッフ',
                connectionId: staffData.connectionId,
                memo: staffData.memo,
                employeeId: staffData.employeeId,
                hourlyWage: staffData.hourlyWage,
                transport: staffData.transport,
                maxMonthly: staffData.maxMonthly,
                monthlyBreak: staffData.monthlyBreak,
                weekMin: staffData.weekMin,
                weekMax: staffData.weekMax,
                monthMin: staffData.monthMin,
                monthMax: staffData.monthMax,
                joinYear: staffData.joinYear,
                joinMonth: staffData.joinMonth,
                joinDay: staffData.joinDay,
                weeklyDays: staffData.weeklyDays,
                tag: staffData.tag,
                applyAll: staffData.applyAll
            };
            
            console.log('Updated staff data:', staffManagementData[staffIndex]);
            
            // 保存
            localStorage.setItem('staffManagementData', JSON.stringify(staffManagementData));
            console.log('Data saved to localStorage');
        } else {
            console.error('Staff index out of range:', staffIndex, 'Total staff:', staffManagementData.length);
        }
    } catch (error) {
        console.error('スタッフ一覧データ更新エラー:', error);
    }
}

// 初期スタッフデータを作成
function createInitialStaffData() {
    return [
        {
            id: '0',
            name: '日野 真文',
            furigana: 'ののたのみ',
            email: 'takafumi.hino@regit-technology.com',
            phone: '09077495849',
            role: '管理者',
            isTemp: false
        },
        {
            id: '1',
            name: 'Regit 高木',
            furigana: 'れじっと たかぎ',
            email: 'bowlingnopin@gmail.com',
            phone: '',
            role: 'スタッフ',
            isTemp: false
        },
        {
            id: '2',
            name: 'タロウ',
            furigana: 'たろう',
            email: 'funingtoor0721@docomo.ne.jp',
            phone: '',
            role: 'スタッフ',
            isTemp: false
        },
        {
            id: '3',
            name: '一雄',
            furigana: '仮',
            email: '',
            phone: '',
            role: 'スタッフ',
            isTemp: true
        },
        {
            id: '4',
            name: '上原',
            furigana: '仮',
            email: '',
            phone: '',
            role: 'スタッフ',
            isTemp: true
        }
    ];
}

// スタッフ一覧画面に戻る
function goBackToStaffList() {
    // 編集中のスタッフID情報をクリア
    sessionStorage.removeItem('editingStaffId');
    
    // index.htmlに遷移
    window.location.href = 'index.html';
}

// タグ追加機能
function addTag() {
    const tagInput = document.getElementById('edit-tag');
    const tagValue = tagInput.value.trim();
    
    if (!tagValue) {
        alert('タグを入力してください。');
        return;
    }
    
    // タグ表示エリアの作成（まだない場合）
    let tagDisplay = document.querySelector('.tag-display');
    if (!tagDisplay) {
        tagDisplay = document.createElement('div');
        tagDisplay.className = 'tag-display';
        tagDisplay.style.marginTop = '10px';
        tagInput.parentNode.appendChild(tagDisplay);
    }
    
    // 新しいタグを追加
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tagValue}
        <i class="fas fa-times tag-remove" onclick="removeTag(this)"></i>
    `;
    tagElement.style.cssText = `
        display: inline-block;
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin: 2px 4px 2px 0;
        cursor: default;
    `;
    
    const removeIcon = tagElement.querySelector('.tag-remove');
    removeIcon.style.cssText = `
        margin-left: 6px;
        cursor: pointer;
        opacity: 0.7;
    `;
    removeIcon.addEventListener('mouseover', function() {
        this.style.opacity = '1';
    });
    removeIcon.addEventListener('mouseout', function() {
        this.style.opacity = '0.7';
    });
    
    tagDisplay.appendChild(tagElement);
    
    // 入力フィールドをクリア
    tagInput.value = '';
}

// タグ削除機能
function removeTag(element) {
    element.parentElement.remove();
}

// メール変更機能
function changeEmail() {
    const currentEmail = document.getElementById('edit-email').value;
    const newEmail = prompt('新しいメールアドレスを入力してください:', currentEmail);
    
    if (newEmail !== null && newEmail.trim() !== '') {
        // 簡単なメール形式チェック
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(newEmail.trim())) {
            document.getElementById('edit-email').value = newEmail.trim();
            alert('メールアドレスを変更しました。');
        } else {
            alert('正しいメールアドレス形式で入力してください。');
        }
    }
}

// フォーム初期化
function initializeEditForm() {
    // 編集中のスタッフデータを読み込み
    const staffId = sessionStorage.getItem('editingStaffId');
    if (staffId) {
        loadStaffDataForEdit(staffId);
    }
    
    // タグ追加ボタンのイベント
    const addTagBtn = document.querySelector('.tag-input-group .btn-primary');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', addTag);
    }
    
    // タグ入力フィールドでEnterキー
    const tagInput = document.getElementById('edit-tag');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
    
    // メール変更ボタン
    const emailChangeBtn = document.querySelector('.email-group .btn-secondary');
    if (emailChangeBtn) {
        emailChangeBtn.addEventListener('click', changeEmail);
    }
    
    // 数値入力フィールドの最小値設定
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.min = '0';
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

// スタッフデータを編集フォームに読み込み
function loadStaffDataForEdit(staffId) {
    try {
        const allStaffData = JSON.parse(localStorage.getItem('allStaffData') || '{}');
        const staffData = allStaffData[staffId];
        
        if (staffData) {
            // フォームにデータを設定
            document.getElementById('edit-name').value = staffData.name || '';
            document.getElementById('edit-furigana').value = staffData.furigana || '';
            document.getElementById('edit-email').value = staffData.email || '';
            document.getElementById('edit-phone').value = staffData.phone || '';
            document.getElementById('edit-connection-id').value = staffData.connectionId || '';
            document.getElementById('edit-memo').value = staffData.memo || '';
            document.getElementById('edit-employee-id').value = staffData.employeeId || '';
            document.getElementById('edit-hourly-wage').value = staffData.hourlyWage || '0';
            document.getElementById('edit-transport').value = staffData.transport || '0';
            document.getElementById('edit-max-monthly').value = staffData.maxMonthly || '0';
            document.getElementById('edit-monthly-break').value = staffData.monthlyBreak || '0';
            document.getElementById('edit-week-min').value = staffData.weekMin || '';
            document.getElementById('edit-week-max').value = staffData.weekMax || '';
            document.getElementById('edit-month-min').value = staffData.monthMin || '';
            document.getElementById('edit-month-max').value = staffData.monthMax || '';
            document.getElementById('edit-join-year').value = staffData.joinYear || '';
            document.getElementById('edit-join-month').value = staffData.joinMonth || '';
            document.getElementById('edit-join-day').value = staffData.joinDay || '';
            document.getElementById('edit-weekly-days').value = staffData.weeklyDays || '0';
            document.getElementById('edit-role').value = staffData.role || 'スタッフ';
            document.getElementById('edit-apply-all').checked = staffData.applyAll || false;
            
            // タイトルにスタッフ名を表示
            const titleElement = document.querySelector('.staff-name-title');
            if (titleElement) {
                titleElement.textContent = staffData.name || 'スタッフ';
            }
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', initializeEditForm);