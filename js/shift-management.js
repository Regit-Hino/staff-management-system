// シフト管理JavaScript - 参考画像通りの機能実装

// グローバル変数
let currentDate = new Date();
let viewType = 'month';
let attendeeOnlyFilter = false;
let confirmedOnlyFilter = false;

// スタッフデータをスタッフ管理ページから取得
function getStaffData() {
    try {
        // localStorageからスタッフデータを取得
        const staffManagementData = localStorage.getItem('staffManagementData');
        if (staffManagementData) {
            const staffList = JSON.parse(staffManagementData);
            console.log('スタッフ管理データから取得:', staffList);
            return staffList.map(staff => ({
                name: staff.name,
                role: staff.role === '管理者' ? 'admin' : 'staff',
                id: staff.id,
                furigana: staff.furigana
            }));
        }
        
        // allStaffDataからも確認
        const allStaffData = localStorage.getItem('allStaffData');
        if (allStaffData) {
            const allStaff = JSON.parse(allStaffData);
            console.log('全スタッフデータから取得:', allStaff);
            return Object.values(allStaff).map(staff => ({
                name: staff.name,
                role: staff.role === '管理者' ? 'admin' : 'staff',
                id: staff.id,
                furigana: staff.furigana
            }));
        }
        
        // デフォルトデータ（フォールバック）
        console.log('デフォルトスタッフデータを使用');
        return [
            { name: '日野 真文', role: 'admin', id: '1', furigana: 'ののたのみ' },
            { name: 'Regit 高木', role: 'staff', id: '2', furigana: 'れじっと たかぎ' },
            { name: 'タロウ', role: 'staff', id: '3', furigana: 'たろう' },
            { name: '一雄', role: 'staff', id: '4', furigana: '仮' },
            { name: '上原', role: 'staff', id: '5', furigana: '仮' }
        ];
    } catch (error) {
        console.error('スタッフデータ取得エラー:', error);
        return [
            { name: '日野 真文', role: 'admin', id: '1', furigana: 'ののたのみ' },
            { name: 'Regit 高木', role: 'staff', id: '2', furigana: 'れじっと たかぎ' },
            { name: 'タロウ', role: 'staff', id: '3', furigana: 'たろう' },
            { name: '一雄', role: 'staff', id: '4', furigana: '仮' },
            { name: '上原', role: 'staff', id: '5', furigana: '仮' }
        ];
    }
}

// 動的にスタッフデータを取得
let staffData = getStaffData();

// シフトデータを動的に生成
function initializeShiftData() {
    const currentStaffData = getStaffData();
    const shiftData = {};
    
    currentStaffData.forEach(staff => {
        shiftData[staff.name] = [];
    });
    
    console.log('初期化されたシフトデータ:', shiftData);
    return shiftData;
}

// シフトデータの初期化
let shiftData = initializeShiftData();

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('シフト管理画面初期化開始');
    
    // スタッフデータを最新に更新
    staffData = getStaffData();
    shiftData = initializeShiftData();
    
    initializeCalendar();
    setupEventListeners();
    setupShiftEditListeners();
    renderShiftTable();
    
    console.log('シフト管理画面初期化完了');
    console.log('使用スタッフデータ:', staffData);
});

// カレンダー初期化
function initializeCalendar() {
    updatePeriodDisplay();
}

// イベントリスナー設定
function setupEventListeners() {
    // 期間ナビゲーション
    document.getElementById('prevPeriod')?.addEventListener('click', () => {
        navigatePeriod(-1);
    });
    
    document.getElementById('nextPeriod')?.addEventListener('click', () => {
        navigatePeriod(1);
    });
    
    // 表示タイプ変更
    document.getElementById('viewType')?.addEventListener('change', (e) => {
        viewType = e.target.value;
        if (viewType === 'custom') {
            showCustomRangeModal();
        } else {
            renderShiftTable();
        }
    });
    
    // モーダルクローズイベント
    setupModalEvents();
}

// 期間表示更新
function updatePeriodDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let startDate, endDate;
    
    switch (viewType) {
        case 'day':
            const day = currentDate.getDate();
            startDate = endDate = `${year}年${month}月${day}日`;
            break;
        case 'week':
            // 週の開始日（月曜日）を計算
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            startDate = `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日`;
            endDate = `${weekEnd.getFullYear()}年${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
            break;
        default: // month
            startDate = `${year}年${month}月1日`;
            const lastDay = new Date(year, month, 0).getDate();
            endDate = `${year}年${month}月${lastDay}日`;
    }
    
    const periodDisplay = document.getElementById('periodDisplay');
    if (periodDisplay) {
        periodDisplay.textContent = `${startDate} - ${endDate}`;
    }
}

// 期間ナビゲーション
function navigatePeriod(direction) {
    switch (viewType) {
        case 'day':
            currentDate.setDate(currentDate.getDate() + direction);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + (direction * 7));
            break;
        default: // month
            currentDate.setMonth(currentDate.getMonth() + direction);
    }
    
    updatePeriodDisplay();
    renderShiftTable();
}

// 日付配列生成（表示タイプに応じて調整）
function generateDateRange() {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    switch (viewType) {
        case 'day':
            // 1日のみ表示
            const singleDay = new Date(currentDate);
            dates.push({
                date: singleDay.getDate(),
                day: singleDay.getDay(),
                fullDate: `${month + 1}/${singleDay.getDate()}`,
                month: month + 1,
                year: year,
                isToday: isToday(singleDay)
            });
            break;
            
        case 'week':
            // 1週間表示（月曜日から日曜日）
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                dates.push({
                    date: date.getDate(),
                    day: date.getDay(),
                    fullDate: `${date.getMonth() + 1}/${date.getDate()}`,
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    isToday: isToday(date)
                });
            }
            break;
            
        default: // month
            // 月全体表示
            const lastDay = new Date(year, month + 1, 0).getDate();
            for (let date = 1; date <= lastDay; date++) {
                const currentDay = new Date(year, month, date);
                dates.push({
                    date: date,
                    day: currentDay.getDay(),
                    fullDate: `${month + 1}/${date}`,
                    month: month + 1,
                    year: year,
                    isToday: isToday(currentDay)
                });
            }
            break;
    }
    
    return dates;
}

// 今日かどうかをチェック
function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

// 曜日名取得
function getDayName(dayNumber) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[dayNumber];
}

// 曜日クラス取得
function getDayClass(dayNumber) {
    if (dayNumber === 0) return 'sunday';
    if (dayNumber === 6) return 'saturday';
    return 'weekday';
}

// シフトテーブル描画（参考画像完全再現）
function renderShiftTable() {
    console.log('シフトテーブル描画開始');
    const table = document.getElementById('shiftTable');
    if (!table) {
        console.error('シフトテーブル要素が見つかりません');
        return;
    }
    
    // テーブルコンテナにビュータイプクラスを追加
    const container = table.closest('.shift-table-container');
    if (container) {
        container.className = 'shift-table-container';
        container.classList.add(`${viewType}-view`);
    }
    
    const dates = generateDateRange();
    console.log('生成された日付:', dates);
    
    // フィルタリングされたスタッフリスト
    const filteredStaff = getFilteredStaff();
    console.log('フィルタリング後のスタッフ:', filteredStaff);
    
    // テーブル構造生成
    let html = '';
    
    // ヘッダー行1（日付数字）
    html += '<tr class="header-row">';
    html += '<th class="staff-name-column">スタッフ名</th>';
    dates.forEach(dateInfo => {
        const todayClass = dateInfo.isToday ? ' today' : '';
        const dayClass = getDayClass(dateInfo.day);
        // 土曜日は青色、日曜日は赤色
        const columnIndex = dates.indexOf(dateInfo);
        const todayColumnClass = dateInfo.isToday ? ` today-column first-row` : '';
        
        if (dateInfo.day === 6) { // 土曜日 - 青色に修正
            html += `<th class="date-column ${dayClass}${todayClass}${todayColumnClass}">
                <div style="font-weight: bold; color: #007bff;">${dateInfo.date}</div>
            </th>`;
        } else if (dateInfo.day === 0) { // 日曜日
            html += `<th class="date-column ${dayClass}${todayClass}${todayColumnClass}">
                <div style="font-weight: bold; color: #dc3545;">${dateInfo.date}</div>
            </th>`;
        } else {
            html += `<th class="date-column ${dayClass}${todayClass}${todayColumnClass}">
                <div style="font-weight: bold;">${dateInfo.date}</div>
            </th>`;
        }
    });
    html += '</tr>';
    
    // ヘッダー行2（曜日）
    html += '<tr class="header-row">';
    html += '<th class="staff-name-column"></th>';
    dates.forEach(dateInfo => {
        const dayClass = getDayClass(dateInfo.day);
        const dayName = getDayName(dateInfo.day);
        const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
        
        if (dateInfo.day === 6) { // 土曜日 - 青色に修正
            html += `<th class="date-column ${dayClass}${todayColumnClass}">
                <div style="font-size: 11px; color: #007bff;">${dayName}</div>
            </th>`;
        } else if (dateInfo.day === 0) { // 日曜日
            html += `<th class="date-column ${dayClass}${todayColumnClass}">
                <div style="font-size: 11px; color: #dc3545;">${dayName}</div>
            </th>`;
        } else {
            html += `<th class="date-column ${dayClass}${todayColumnClass}">
                <div style="font-size: 11px;">${dayName}</div>
            </th>`;
        }
    });
    html += '</tr>';
    
    // サマリー行（割当人数）
    html += '<tr class="summary-row">';
    html += '<td class="summary-label">割当人数</td>';
    dates.forEach(dateInfo => {
        const count = countAssignedStaff(dateInfo.fullDate);
        const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
        console.log(`Rendering assignment count for ${dateInfo.fullDate}: ${count}`);
        html += `<td class="${todayColumnClass}" style="font-family: 'Yu Gothic', sans-serif; font-weight: bold;">${count}</td>`;
    });
    html += '</tr>';
    
    // サマリー行（人数）
    html += '<tr class="summary-row">';
    html += '<td class="summary-label">人数</td>';
    dates.forEach(dateInfo => {
        const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
        html += `<td class="${todayColumnClass}" style="font-family: 'Yu Gothic', sans-serif; font-weight: bold;">0</td>`;
    });
    html += '</tr>';
    
    // サマリー行（人件費）
    html += '<tr class="summary-row">';
    html += '<td class="summary-label">人件費</td>';
    dates.forEach(dateInfo => {
        const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
        html += `<td class="${todayColumnClass}" style="font-family: 'Yu Gothic', sans-serif; font-weight: bold;">0円</td>`;
    });
    html += '</tr>';
    
    // スタッフ行
    filteredStaff.forEach((staff, staffIndex) => {
        html += '<tr class="staff-row">';
        const adminClass = staff.role === 'admin' ? ' admin' : '';
        html += `<td class="staff-name-cell${adminClass}">${staff.name}</td>`;
        
        dates.forEach(dateInfo => {
            const shiftContent = getShiftContent(staff.name, dateInfo.fullDate);
            const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
            // 最後のスタッフの場合は last-row クラスを追加
            const lastRowClass = (staffIndex === filteredStaff.length - 1 && dateInfo.isToday) ? ' last-row' : '';
            html += `<td class="shift-cell${todayColumnClass}${lastRowClass}">${shiftContent}</td>`;
        });
        
        html += '</tr>';
    });
    
    // テーブルを確実にクリアしてから新しいHTMLを設定
    table.innerHTML = '';
    table.innerHTML = html;
    
    // シフトセルにクリックイベントを追加
    addShiftCellClickEvents();
    
    console.log('シフトテーブル描画完了');
    console.log('Current filtered staff count:', getFilteredStaff().length);
}

// シフトセルクリックイベント追加
function addShiftCellClickEvents() {
    const shiftCells = document.querySelectorAll('.shift-cell');
    console.log(`シフトセルクリックイベント設定: ${shiftCells.length}個のセル`);
    
    shiftCells.forEach((cell, index) => {
        cell.addEventListener('click', function(event) {
            event.preventDefault();
            console.log(`シフトセルクリック: セル${index}`);
            
            // クリックされたセルの情報を取得
            const row = this.closest('tr');
            const table = this.closest('table');
            const cellIndex = Array.from(row.children).indexOf(this);
            const rowIndex = Array.from(table.rows).indexOf(row);
            
            console.log(`セル位置: 行${rowIndex}, 列${cellIndex}`);
            
            // スタッフ名を取得（最初の列から）
            const staffNameCell = row.querySelector('.staff-name-cell');
            if (!staffNameCell) {
                console.error('スタッフ名セルが見つかりません');
                return;
            }
            
            const staffName = staffNameCell.textContent.trim();
            console.log(`スタッフ名: ${staffName}`);
            
            // 日付情報を取得（ヘッダーから）
            const dates = generateDateRange();
            const dateIndex = cellIndex - 1; // スタッフ名列分を引く
            
            if (dateIndex >= 0 && dateIndex < dates.length) {
                const dateInfo = dates[dateIndex];
                console.log(`日付情報:`, dateInfo);
                openShiftEditModal(staffName, dateInfo);
            } else {
                console.error(`無効な日付インデックス: ${dateIndex}`);
            }
        });
    });
}

// フィルタリングされたスタッフ取得
function getFilteredStaff() {
    if (!attendeeOnlyFilter) {
        return staffData;
    }
    
    // 出勤者のみフィルター適用
    return staffData.filter(staff => {
        return hasShiftInCurrentPeriod(staff.name);
    });
}

// 現在の期間にシフトがあるかチェック
function hasShiftInCurrentPeriod(staffName) {
    const dates = generateDateRange();
    return dates.some(dateInfo => hasShiftOnDate(staffName, dateInfo.fullDate));
}

// 特定日にシフトがあるかチェック
function hasShiftOnDate(staffName, dateString) {
    console.log('hasShiftOnDate called:', staffName, dateString);
    
    const shifts = getShiftData();
    if (!shifts[staffName]) {
        console.log('No shifts for staff:', staffName);
        return false;
    }
    
    const [month, date] = dateString.split('/');
    const currentYear = currentDate.getFullYear();
    const shiftKey = `${currentYear}-${month}-${date}`;
    
    console.log('Checking shiftKey:', shiftKey);
    const hasShift = !!shifts[staffName][shiftKey];
    console.log('Has shift:', hasShift);
    
    return hasShift;
}

// シフト内容取得（削除：重複関数のため後半の正しい実装を使用）

// 割当人数カウント
function countAssignedStaff(dateString) {
    console.log('countAssignedStaff called:', dateString);
    
    const shifts = getShiftData();
    const [month, date] = dateString.split('/');
    const currentYear = currentDate.getFullYear();
    const shiftKey = `${currentYear}-${month}-${date}`;
    
    console.log('Counting shifts for date:', shiftKey);
    console.log('Available shift data:', shifts);
    
    let count = 0;
    
    // フィルタリングされたスタッフデータを使用（出勤者のみフィルターなどを考慮）
    const filteredStaff = getFilteredStaff();
    
    filteredStaff.forEach(staff => {
        if (shifts[staff.name] && shifts[staff.name][shiftKey]) {
            const shift = shifts[staff.name][shiftKey];
            // シフトデータが存在し、空でない場合のみカウント
            if (shift && (shift.label || shift.startTime || shift.endTime || shift.quickType)) {
                count++;
                console.log(`Found valid shift for ${staff.name} on ${shiftKey}:`, shift);
            }
        }
    });
    
    console.log('Total assigned staff count:', count);
    return count;
}

// モーダル関連
function setupModalEvents() {
    // フィルターモーダル
    const filterModal = document.getElementById('filterModal');
    if (filterModal) {
        // 背景クリックで閉じる
        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                closeFilterModal();
            }
        });
        
        // ×ボタンで閉じる
        const closeBtn = filterModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeFilterModal);
        }
    }
    
    // カスタム期間モーダル
    const customRangeModal = document.getElementById('customRangeModal');
    if (customRangeModal) {
        // 背景クリックで閉じる
        customRangeModal.addEventListener('click', (e) => {
            if (e.target === customRangeModal) {
                closeCustomRangeModal();
            }
        });
        
        // ×ボタンで閉じる
        const closeBtn = customRangeModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCustomRangeModal);
        }
    }
}

// フィルターモーダル表示
function showFilterModal() {
    console.log('フィルターモーダル表示');
    const modal = document.getElementById('filterModal');
    if (modal) {
        // 現在のフィルター状態を反映
        const attendeeCheckbox = document.getElementById('attendeeOnlyFilter');
        const confirmedCheckbox = document.getElementById('confirmedOnlyFilter');
        
        if (attendeeCheckbox) attendeeCheckbox.checked = attendeeOnlyFilter;
        if (confirmedCheckbox) confirmedCheckbox.checked = confirmedOnlyFilter;
        
        modal.style.display = 'block';
    }
}

// フィルターモーダル閉じる
function closeFilterModal() {
    console.log('フィルターモーダル閉じる');
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// フィルター適用
function applyFilters() {
    console.log('フィルター適用');
    
    const attendeeCheckbox = document.getElementById('attendeeOnlyFilter');
    const confirmedCheckbox = document.getElementById('confirmedOnlyFilter');
    
    attendeeOnlyFilter = attendeeCheckbox ? attendeeCheckbox.checked : false;
    confirmedOnlyFilter = confirmedCheckbox ? confirmedCheckbox.checked : false;
    
    console.log('出勤者のみフィルター:', attendeeOnlyFilter);
    console.log('確定のみフィルター:', confirmedOnlyFilter);
    
    closeFilterModal();
    renderShiftTable();
}

// フィルタークリア
function clearFilters() {
    console.log('フィルタークリア');
    attendeeOnlyFilter = false;
    confirmedOnlyFilter = false;
    
    const attendeeCheckbox = document.getElementById('attendeeOnlyFilter');
    const confirmedCheckbox = document.getElementById('confirmedOnlyFilter');
    
    if (attendeeCheckbox) attendeeCheckbox.checked = false;
    if (confirmedCheckbox) confirmedCheckbox.checked = false;
    
    applyFilters();
}

// カスタム期間モーダル表示
function showCustomRangeModal() {
    console.log('カスタム期間モーダル表示');
    const modal = document.getElementById('customRangeModal');
    if (modal) {
        modal.style.display = 'block';
        // カレンダー初期化などの処理をここに追加
    }
}

// カスタム期間モーダル閉じる
function closeCustomRangeModal() {
    console.log('カスタム期間モーダル閉じる');
    const modal = document.getElementById('customRangeModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 表示タイプを月に戻す
    const viewTypeSelect = document.getElementById('viewType');
    if (viewTypeSelect) {
        viewTypeSelect.value = 'month';
        viewType = 'month';
    }
}

// カスタム期間適用
function applyCustomRange() {
    console.log('カスタム期間適用');
    // カスタム期間の実装
    closeCustomRangeModal();
}

// シフト編集モーダル関連の変数
let currentEditingStaff = null;
let currentEditingDate = null;
let selectedColor = '';

// シフト編集モーダルを開く
function openShiftEditModal(staffName, dateInfo) {
    console.log('openShiftEditModal開始:', staffName, dateInfo);
    
    currentEditingStaff = staffName;
    currentEditingDate = dateInfo;
    
    // モーダルタイトル設定
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayName = dayNames[dateInfo.day];
    const title = `${staffName} - ${dateInfo.year}年${dateInfo.month}月${dateInfo.date}日（${dayName}）`;
    
    const titleElement = document.getElementById('shiftEditTitle');
    if (!titleElement) {
        console.error('shiftEditTitle要素が見つかりません');
        return;
    }
    titleElement.textContent = title;
    
    // 既存のシフトデータを読み込み
    loadShiftData(staffName, dateInfo);
    
    // モーダル表示
    const modal = document.getElementById('shiftEditModal');
    if (!modal) {
        console.error('shiftEditModal要素が見つかりません');
        return;
    }
    
    console.log('モーダル表示前の状態:', modal.style.display);
    modal.style.display = 'block';
    console.log('モーダル表示後の状態:', modal.style.display);
    
    setTimeout(() => {
        modal.classList.add('show');
        console.log('showクラス追加完了');
    }, 10);
}

// シフト編集モーダルを閉じる
function closeShiftEditModal() {
    const modal = document.getElementById('shiftEditModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        resetShiftForm();
    }, 300);
}

// シフトフォームをリセット
function resetShiftForm() {
    document.getElementById('shiftLabel').value = '';
    document.getElementById('shiftStartTime').value = '';
    document.getElementById('shiftEndTime').value = '';
    document.getElementById('shiftBreakTime').value = '';
    document.getElementById('shiftConfirmed').checked = false;
    document.getElementById('weeklyRepeat').checked = false;
    
    // カラー選択をリセット
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.color-option.none-option').classList.add('selected');
    selectedColor = '';
    
    // 簡易登録ボタンをリセット
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// 既存シフトデータを読み込み
function loadShiftData(staffName, dateInfo) {
    const shiftKey = `${dateInfo.year}-${dateInfo.month}-${dateInfo.date}`;
    const shifts = getShiftData();
    
    if (shifts[staffName] && shifts[staffName][shiftKey]) {
        const shift = shifts[staffName][shiftKey];
        
        document.getElementById('shiftLabel').value = shift.label || '';
        document.getElementById('shiftStartTime').value = shift.startTime || '';
        document.getElementById('shiftEndTime').value = shift.endTime || '';
        document.getElementById('shiftBreakTime').value = shift.breakTime || '';
        document.getElementById('shiftConfirmed').checked = shift.confirmed || false;
        
        // カラー設定
        selectedColor = shift.color || '';
        updateColorSelection(selectedColor);
        
        // 簡易登録タイプ設定
        if (shift.quickType) {
            updateQuickTypeSelection(shift.quickType);
        }
    } else {
        resetShiftForm();
    }
}

// シフトデータを取得
function getShiftData() {
    try {
        const data = localStorage.getItem('shiftScheduleData');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('シフトデータ取得エラー:', error);
        return {};
    }
}

// カラー選択を更新
function updateColorSelection(color) {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
    selectedColor = color;
}

// 簡易登録タイプ選択を更新
function updateQuickTypeSelection(type) {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.type === type) {
            btn.classList.add('selected');
        }
    });
}

// シフト保存
function saveShift() {
    const shiftData = {
        label: document.getElementById('shiftLabel').value.trim(),
        startTime: document.getElementById('shiftStartTime').value.trim(),
        endTime: document.getElementById('shiftEndTime').value.trim(),
        breakTime: document.getElementById('shiftBreakTime').value.trim(),
        color: selectedColor,
        confirmed: document.getElementById('shiftConfirmed').checked,
        weeklyRepeat: document.getElementById('weeklyRepeat').checked
    };
    
    // 簡易登録タイプを取得
    const selectedQuickBtn = document.querySelector('.quick-btn.selected');
    if (selectedQuickBtn) {
        shiftData.quickType = selectedQuickBtn.dataset.type;
    }
    
    console.log('Saving shift data:', shiftData);
    console.log('Staff:', currentEditingStaff);
    console.log('Date:', currentEditingDate);
    
    // バリデーション
    if (!validateShiftData(shiftData)) {
        return;
    }
    
    // データ保存
    saveShiftData(currentEditingStaff, currentEditingDate, shiftData);
    
    // モーダルを閉じる
    closeShiftEditModal();
    
    // テーブル再描画
    console.log('Calling renderShiftTable to refresh display');
    renderShiftTable();
    
    // 割当人数の更新を確認
    setTimeout(() => {
        console.log('Verifying assignment count after save');
        const dates = generateDateRange();
        dates.forEach(dateInfo => {
            const count = countAssignedStaff(dateInfo.fullDate);
            console.log(`Updated count for ${dateInfo.fullDate}: ${count}`);
        });
    }, 100);
}

// 時刻の自動補完関数
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

// シフトデータ検証
function validateShiftData(data) {
    console.log('Validating shift data:', data);
    
    // 時刻の自動補完
    data.startTime = normalizeTime(data.startTime);
    data.endTime = normalizeTime(data.endTime);
    data.breakTime = normalizeTime(data.breakTime);
    
    console.log('Normalized time data:', data);
    
    // 簡易登録の場合はバリデーションをスキップ
    if (data.quickType) {
        console.log('Quick type detected, skipping time validation');
        return true;
    }
    
    // ラベルがある場合、または時刻が入力されている場合のみ処理
    if (!data.label && !data.startTime && !data.endTime) {
        console.log('No label or time entered, allowing empty shift');
        return true;
    }
    
    // 時刻フォーマット検証（補完後）
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (data.startTime && !timePattern.test(data.startTime)) {
        alert('開始時刻の形式が正しくありません（例: 10:00 または 10）');
        return false;
    }
    
    if (data.endTime && !timePattern.test(data.endTime)) {
        alert('終了時刻の形式が正しくありません（例: 21:00 または 21）');
        return false;
    }
    
    if (data.breakTime && !timePattern.test(data.breakTime)) {
        alert('休憩時間の形式が正しくありません（例: 1:00 または 1）');
        return false;
    }
    
    console.log('Validation passed');
    return true;
}

// シフトデータを保存
function saveShiftData(staffName, dateInfo, data) {
    console.log('=== saveShiftData START ===');
    console.log('Staff:', staffName);
    console.log('DateInfo:', dateInfo);
    console.log('Data:', data);
    
    const shifts = getShiftData();
    console.log('Current shifts before save:', shifts);
    
    const shiftKey = `${dateInfo.year}-${dateInfo.month}-${dateInfo.date}`;
    console.log('Generated shiftKey:', shiftKey);
    
    if (!shifts[staffName]) {
        shifts[staffName] = {};
        console.log('Created new staff entry for:', staffName);
    }
    
    shifts[staffName][shiftKey] = data;
    console.log('Updated shifts object:', shifts);
    
    try {
        localStorage.setItem('shiftScheduleData', JSON.stringify(shifts));
        console.log('シフトデータ保存完了:', staffName, shiftKey, data);
        
        // 保存後の確認
        const savedData = localStorage.getItem('shiftScheduleData');
        console.log('Confirmed saved data:', savedData);
        
    } catch (error) {
        console.error('シフトデータ保存エラー:', error);
        alert('シフトデータの保存に失敗しました');
    }
    
    console.log('=== saveShiftData END ===');
}

// シフト編集モーダルのイベントリスナー設定
function setupShiftEditListeners() {
    // カラー選択イベント
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedColor = this.dataset.color || '';
        });
    });
    
    // 簡易登録ボタンイベント
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 選択状態をトグル
            const wasSelected = this.classList.contains('selected');
            document.querySelectorAll('.quick-btn').forEach(b => {
                b.classList.remove('selected');
            });
            
            if (!wasSelected) {
                this.classList.add('selected');
                applyQuickRegister(this.dataset.type);
            }
        });
    });
    
    // 時刻入力フィールドの自動補完
    const timeInputs = ['shiftStartTime', 'shiftEndTime', 'shiftBreakTime'];
    timeInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                const normalized = normalizeTime(this.value);
                if (normalized !== this.value) {
                    this.value = normalized;
                    console.log(`Auto-corrected ${inputId}: ${this.value} -> ${normalized}`);
                }
            });
            
            input.addEventListener('keypress', function(e) {
                // Enterキーでも自動補完
                if (e.key === 'Enter') {
                    const normalized = normalizeTime(this.value);
                    if (normalized !== this.value) {
                        this.value = normalized;
                    }
                }
            });
        }
    });
    
    // モーダル背景クリックで閉じる
    document.getElementById('shiftEditModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeShiftEditModal();
        }
    });
}

// 簡易登録を適用
function applyQuickRegister(type) {
    switch(type) {
        case 'attendance':
            document.getElementById('shiftLabel').value = '';
            document.getElementById('shiftStartTime').value = '10:00';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '0:00';
            break;
        case 'absence':
            document.getElementById('shiftLabel').value = '';
            document.getElementById('shiftStartTime').value = '';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '';
            break;
        case 'paid-leave':
            document.getElementById('shiftLabel').value = '有休';
            document.getElementById('shiftStartTime').value = '';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '';
            selectedColor = '#4caf50';
            updateColorSelection(selectedColor);
            break;
        case 'half-leave':
            document.getElementById('shiftLabel').value = '半有休';
            document.getElementById('shiftStartTime').value = '';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '';
            selectedColor = '#ff9800';
            updateColorSelection(selectedColor);
            break;
        case 'legal-holiday':
            document.getElementById('shiftLabel').value = '法定休日';
            document.getElementById('shiftStartTime').value = '';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '';
            selectedColor = '#e53935';
            updateColorSelection(selectedColor);
            break;
        case 'non-legal-holiday':
            document.getElementById('shiftLabel').value = '法定外休日';
            document.getElementById('shiftStartTime').value = '';
            document.getElementById('shiftEndTime').value = '';
            document.getElementById('shiftBreakTime').value = '';
            selectedColor = '#9c27b0';
            updateColorSelection(selectedColor);
            break;
    }
}

// シフト内容を取得（表示用）
function getShiftContent(staffName, dateString) {
    console.log('getShiftContent called:', staffName, dateString);
    
    const shifts = getShiftData();
    console.log('Retrieved shifts data:', shifts);
    
    const [month, date] = dateString.split('/');
    const currentYear = currentDate.getFullYear();
    const shiftKey = `${currentYear}-${month}-${date}`;
    
    console.log('Looking for shiftKey:', shiftKey);
    console.log('Available keys for staff:', shifts[staffName] ? Object.keys(shifts[staffName]) : 'No data');
    
    if (shifts[staffName] && shifts[staffName][shiftKey]) {
        const shift = shifts[staffName][shiftKey];
        console.log('Found shift:', shift);
        return formatShiftDisplay(shift);
    }
    
    console.log('No shift found for:', staffName, shiftKey);
    return '';
}

// シフト表示をフォーマット（95px幅対応）
function formatShiftDisplay(shift) {
    if (shift.quickType) {
        // 簡易登録の場合
        switch(shift.quickType) {
            case 'attendance':
                return '<div class="shift-entry" style="color: #28a745; font-size: 16px; font-weight: bold; text-align: center; width: 85px;">○</div>';
            case 'absence':
                return '<div class="shift-entry" style="color: #dc3545; font-size: 16px; font-weight: bold; text-align: center; width: 85px;">×</div>';
            case 'paid-leave':
                return '<div class="shift-entry" style="background-color: #4caf50; color: white; padding: 3px 4px; border-radius: 3px; font-size: 11px; font-weight: 500; width: 85px; text-align: center;">有休</div>';
            case 'half-leave':
                return '<div class="shift-entry" style="background-color: #ff9800; color: white; padding: 3px 4px; border-radius: 3px; font-size: 11px; font-weight: 500; width: 85px; text-align: center;">半有休</div>';
            case 'legal-holiday':
                return '<div class="shift-entry" style="background-color: #e53935; color: white; padding: 3px 4px; border-radius: 3px; font-size: 10px; font-weight: 500; width: 85px; text-align: center;">法定休日</div>';
            case 'non-legal-holiday':
                return '<div class="shift-entry" style="background-color: #9c27b0; color: white; padding: 3px 4px; border-radius: 3px; font-size: 9px; font-weight: 500; width: 85px; text-align: center;">法定外休日</div>';
        }
    }
    
    // 通常のシフト表示
    let content = '';
    
    if (shift.label) {
        const color = shift.color || '#007bff';
        const timeText = shift.startTime && shift.endTime ? 
            `${shift.startTime}~${shift.endTime}` : 
            (shift.startTime ? `${shift.startTime}~` : '');
        
        content = `<div class="shift-entry" style="background-color: ${color}; color: white; padding: 3px 4px; border-radius: 3px; font-size: 10px; margin: 1px 0; font-weight: 500; width: 85px; overflow: hidden; text-overflow: ellipsis;">
            <div style="font-weight: bold; font-size: 11px; overflow: hidden; text-overflow: ellipsis;">${shift.label}</div>
            ${timeText ? `<div style="font-size: 9px; margin-top: 1px; overflow: hidden; text-overflow: ellipsis;">${timeText}</div>` : ''}
        </div>`;
    } else if (shift.startTime && shift.endTime) {
        content = `<div class="shift-entry" style="color: #007bff; font-size: 10px; text-align: center; font-weight: 500; padding: 3px 4px; width: 85px; overflow: hidden; text-overflow: ellipsis;">
            ${shift.startTime}~${shift.endTime}
        </div>`;
    }
    
    return content;
}

// シフト削除
function deleteShift() {
    if (!confirm('このシフトを削除しますか？')) {
        return;
    }
    
    const shifts = getShiftData();
    const shiftKey = `${currentEditingDate.year}-${currentEditingDate.month}-${currentEditingDate.date}`;
    
    if (shifts[currentEditingStaff] && shifts[currentEditingStaff][shiftKey]) {
        delete shifts[currentEditingStaff][shiftKey];
        
        try {
            localStorage.setItem('shiftScheduleData', JSON.stringify(shifts));
            console.log('シフトデータ削除完了:', currentEditingStaff, shiftKey);
        } catch (error) {
            console.error('シフトデータ削除エラー:', error);
        }
    }
    
    closeShiftEditModal();
    renderShiftTable();
}

// グローバル関数として公開
window.showFilterModal = showFilterModal;
window.closeFilterModal = closeFilterModal;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.showCustomRangeModal = showCustomRangeModal;
window.closeCustomRangeModal = closeCustomRangeModal;
window.applyCustomRange = applyCustomRange;
window.closeShiftEditModal = closeShiftEditModal;
window.saveShift = saveShift;
window.deleteShift = deleteShift;