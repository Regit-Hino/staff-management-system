// シフト管理システム - JavaScript

// グローバル変数
let currentDate = new Date();
let currentViewType = 'month';
let calendarStartDate = null;
let calendarEndDate = null;
let staffData = [];
let customRangeStartDate = null;
let customRangeEndDate = null;
let isSelectingRange = false;
let attendeeOnlyFilter = false;
let confirmedOnlyFilter = false;
let filteredStaffData = []; // フィルター適用済みスタッフデータ

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing shift management');
    loadStaffData();
    initializeCalendar();
    initializeEventListeners();
    
    // フィルターボタンのイベントリスナーを直接設定（確実な動作のため）
    const filterBtn = document.getElementById('filterBtn');
    console.log('Filter button element:', filterBtn);
    if (filterBtn) {
        // 複数の方法でイベントリスナーを設定（確実な動作のため）
        filterBtn.addEventListener('click', function(e) {
            console.log('Filter button clicked via addEventListener');
            e.preventDefault();
            e.stopPropagation();
            showFilterModal();
        });
        
        // onclickも確実に設定
        filterBtn.onclick = function(e) {
            console.log('Filter button clicked via onclick');
            e.preventDefault();
            e.stopPropagation();
            showFilterModal();
            return false;
        };
        
        console.log('Filter button event listeners added');
    } else {
        console.error('Filter button not found!');
    }
    
    // テスト用：ページロード後5秒でモーダルテスト
    setTimeout(function() {
        console.log('Testing filter modal after 5 seconds');
        if (window.showFilterModal) {
            console.log('showFilterModal function is available globally');
        } else {
            console.error('showFilterModal function is not available globally');
        }
    }, 5000);
});

// スタッフデータの読み込み
function loadStaffData() {
    const savedData = localStorage.getItem('staffManagementData');
    if (savedData) {
        staffData = JSON.parse(savedData);
    } else {
        // デフォルトスタッフデータ
        staffData = [
            { id: '0', name: '日野 真文', furigana: 'ひの たかふみ', role: '管理者' },
            { id: '1', name: 'Regit 高木', furigana: 'れじっと たかぎ', role: 'スタッフ' },
            { id: '2', name: 'タロウ', furigana: 'たろう', role: 'スタッフ' },
            { id: '3', name: '一雄', furigana: 'かずお', role: 'スタッフ' },
            { id: '4', name: '上原', furigana: 'うえはら', role: 'スタッフ' }
        ];
    }
    
    // フィルターデータ更新とスタッフリスト描画はrenderCalendar内で実行
    // updateFilteredStaffData();
    // renderStaffList();
}

// フィルター適用済みスタッフデータを更新
function updateFilteredStaffData() {
    filteredStaffData = staffData;
    
    // 出勤者のみフィルター
    if (attendeeOnlyFilter) {
        filteredStaffData = staffData.filter(staff => hasShiftInDateRange(staff));
    }
    
    console.log('Filtered staff count:', filteredStaffData.length);
}

// 表示範囲内でシフトがあるかチェック
function hasShiftInDateRange(staff) {
    if (!calendarStartDate || !calendarEndDate) return true;
    
    const daysToCheck = getDaysToShow();
    
    for (let date of daysToCheck) {
        if (hasShiftOnDate(staff, date)) {
            return true;
        }
    }
    return false;
}

// 特定の日にシフトがあるかチェック
function hasShiftOnDate(staff, date) {
    // サンプルデータに基づいてシフトの有無を判定
    if (staff.name === '日野 真文') {
        return date.getDay() === 1 && date.getDate() === 2; // 6/2 月曜日
    } else if (staff.name === 'Regit 高木') {
        return date.getDay() === 2 && date.getDate() === 3; // 6/3 火曜日
    } else if (staff.name === '上原') {
        return date.getDay() === 1 && date.getDate() === 2; // 6/2 月曜日
    } else if (staff.name === 'Takafumi Hino') {
        return false; // Takafumi Hinoにはシフトなし
    }
    return false;
}

// スタッフリストの描画
function renderStaffList() {
    const staffListElement = document.getElementById('staffList');
    staffListElement.innerHTML = '';
    
    // フィルター済みデータを使用（重複フィルター処理を避ける）
    filteredStaffData.forEach(staff => {
        const staffRow = document.createElement('div');
        staffRow.className = 'staff-row';
        
        const adminClass = staff.role === '管理者' ? ' admin' : '';
        staffRow.innerHTML = `
            <div class="staff-name${adminClass}">${staff.name}</div>
            <div class="staff-info">${staff.furigana}</div>
        `;
        staffListElement.appendChild(staffRow);
    });
    
    console.log('Rendered staff list with', filteredStaffData.length, 'staff members');
}

// カレンダー初期化
function initializeCalendar() {
    setCurrentMonth();
    renderCalendar();
}

// 現在の月を設定
function setCurrentMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (currentViewType === 'month') {
        calendarStartDate = new Date(year, month, 1);
        calendarEndDate = new Date(year, month + 1, 0);
    } else if (currentViewType === 'week') {
        const today = new Date(currentDate);
        const dayOfWeek = today.getDay();
        calendarStartDate = new Date(today);
        calendarStartDate.setDate(today.getDate() - dayOfWeek);
        calendarEndDate = new Date(calendarStartDate);
        calendarEndDate.setDate(calendarStartDate.getDate() + 6);
    } else if (currentViewType === 'day') {
        calendarStartDate = new Date(currentDate);
        calendarEndDate = new Date(currentDate);
    }
    
    updatePeriodDisplay();
}

// 期間表示の更新
function updatePeriodDisplay() {
    const periodDisplay = document.getElementById('periodDisplay');
    const startStr = formatDate(calendarStartDate);
    const endStr = formatDate(calendarEndDate);
    
    if (calendarStartDate.getTime() === calendarEndDate.getTime()) {
        periodDisplay.textContent = startStr;
    } else {
        periodDisplay.textContent = `${startStr} - ${endStr}`;
    }
}

// 日付フォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// カレンダーの描画
function renderCalendar() {
    // カレンダー描画前にフィルターデータを更新（期間変更時の同期のため）
    updateFilteredStaffData();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // ビュータイプに応じたクラスを追加
    calendarGrid.className = 'calendar-grid';
    if (currentViewType === 'day') {
        calendarGrid.classList.add('day-view');
    } else if (currentViewType === 'week') {
        calendarGrid.classList.add('week-view');
    }
    
    const daysToShow = getDaysToShow();
    
    daysToShow.forEach(date => {
        const column = createCalendarColumn(date);
        calendarGrid.appendChild(column);
    });
    
    // カレンダー描画後に同じフィルターデータでスタッフリストを描画（確実な同期のため）
    renderStaffList();
    
    console.log('Rendered calendar with', filteredStaffData.length, 'staff members per column');
}

// 表示する日付の取得
function getDaysToShow() {
    const days = [];
    const current = new Date(calendarStartDate);
    
    while (current <= calendarEndDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return days;
}

// カレンダー列の作成
function createCalendarColumn(date) {
    const column = document.createElement('div');
    column.className = 'calendar-column';
    
    // 日付ヘッダー
    const header = createDateHeader(date);
    column.appendChild(header);
    
    // サマリー行
    const summaryRows = ['割当人数', '人時', '人件費'];
    summaryRows.forEach(label => {
        const summaryCell = document.createElement('div');
        summaryCell.className = 'summary-cell';
        
        // 週末の背景色を適用
        const dayOfWeekIndex = date.getDay();
        if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
            summaryCell.classList.add('weekend');
        }
        
        summaryCell.textContent = getSummaryValue(date, label);
        column.appendChild(summaryCell);
    });
    
    // フィルター済みスタッフのシフトセル（重複フィルター処理を避ける）
    filteredStaffData.forEach(staff => {
        const shiftCell = createShiftCell(date, staff);
        column.appendChild(shiftCell);
    });
    
    return column;
}

// 日付ヘッダーの作成
function createDateHeader(date) {
    const header = document.createElement('div');
    header.className = 'date-header';
    
    const dayOfWeek = getDayOfWeekString(date.getDay());
    const dayNumber = date.getDate();
    const month = date.getMonth() + 1;
    
    const isToday = isDateToday(date);
    const dayOfWeekIndex = date.getDay();
    
    // 曜日に応じたクラス追加
    if (dayOfWeekIndex === 0) {
        header.classList.add('sunday');
    } else if (dayOfWeekIndex === 6) {
        header.classList.add('saturday');
    }
    
    if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
        header.classList.add('weekend');
    }
    
    if (isToday) {
        header.classList.add('date-today');
    }
    
    header.innerHTML = `
        <div class="date-day">${dayOfWeek}</div>
        <div class="date-number">${month}/${dayNumber}</div>
    `;
    
    return header;
}

// 曜日文字列の取得
function getDayOfWeekString(dayOfWeek) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[dayOfWeek];
}

// 今日かどうかの判定
function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// サマリー値の取得
function getSummaryValue(date, label) {
    // 実際の値は後で実装
    switch (label) {
        case '割当人数':
            return getShiftCount(date);
        case '人時':
            return getWorkingHours(date);
        case '人件費':
            return '0円';
        default:
            return '0';
    }
}

// シフト数の取得
function getShiftCount(date) {
    // サンプルデータ
    if (date.getDay() === 1 || date.getDay() === 2) {
        return Math.floor(Math.random() * 3) + 1;
    }
    return 0;
}

// 労働時間の取得
function getWorkingHours(date) {
    const count = getShiftCount(date);
    if (count > 0) {
        return count * 8 + Math.floor(Math.random() * 5);
    }
    return 0;
}

// シフトセルの作成
function createShiftCell(date, staff) {
    const cell = document.createElement('div');
    cell.className = 'shift-cell';
    
    // 週末の背景色を適用
    const dayOfWeekIndex = date.getDay();
    if (dayOfWeekIndex === 0 || dayOfWeekIndex === 6) {
        cell.classList.add('weekend');
    }
    
    // サンプルシフトデータ（画像に合わせて）
    const today = new Date();
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    if (staff.name === '日野 真文') {
        if (date.getDay() === 1 && date.getDate() === 2) { // 6/2 月曜日
            const shiftEntry = document.createElement('div');
            shiftEntry.className = 'shift-entry';
            shiftEntry.innerHTML = `<span class="shift-time">10:00 - 21:00</span>`;
            cell.appendChild(shiftEntry);
        }
    } else if (staff.name === 'Regit 高木') {
        if (date.getDay() === 2 && date.getDate() === 3) { // 6/3 火曜日
            const shiftEntry = document.createElement('div');
            shiftEntry.className = 'shift-entry';
            shiftEntry.innerHTML = `<span class="shift-time">10:00 - 21:00</span>`;
            cell.appendChild(shiftEntry);
        }
    } else if (staff.name === '上原') {
        if (date.getDay() === 1 && date.getDate() === 2) { // 6/2 月曜日
            const shiftEntry = document.createElement('div');
            shiftEntry.className = 'shift-entry';
            shiftEntry.innerHTML = `
                <span class="shift-time">10:00 -</span>
                <div class="shift-break"></div>
            `;
            cell.appendChild(shiftEntry);
        }
    } else if (staff.name === 'Takafumi Hino') {
        // Takafumi Hinoのシフトデータなし（空のセルを維持）
    }
    
    return cell;
}

// イベントリスナーの初期化
function initializeEventListeners() {
    // 前の期間
    document.getElementById('prevPeriod').addEventListener('click', function() {
        navigatePeriod(-1);
    });
    
    // 次の期間
    document.getElementById('nextPeriod').addEventListener('click', function() {
        navigatePeriod(1);
    });
    
    // 今日ボタン
    document.querySelector('.today-btn').addEventListener('click', function() {
        currentDate = new Date();
        setCurrentMonth();
        renderCalendar();
    });
    
    // ビュータイプ変更
    document.getElementById('viewType').addEventListener('change', function() {
        currentViewType = this.value;
        if (currentViewType === 'custom') {
            showCustomRangeModal();
        } else {
            setCurrentMonth();
            renderCalendar();
        }
    });
    
    // フィルターボタンのイベントリスナーは上で既に設定済み（重複を避けるため削除）
}

// フィルターモーダルの表示
window.showFilterModal = function showFilterModal() {
    console.log('showFilterModal called');
    const modal = document.getElementById('filterModal');
    console.log('Filter modal element:', modal);
    
    if (modal) {
        console.log('Setting modal display to block');
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        // 現在のフィルター状態を反映
        const attendeeCheckbox = document.getElementById('attendeeOnlyFilter');
        const confirmedCheckbox = document.getElementById('confirmedOnlyFilter');
        
        console.log('Attendee checkbox:', attendeeCheckbox);
        console.log('Confirmed checkbox:', confirmedCheckbox);
        
        if (attendeeCheckbox) attendeeCheckbox.checked = attendeeOnlyFilter;
        if (confirmedCheckbox) confirmedCheckbox.checked = confirmedOnlyFilter;
        
        console.log('Filter modal should now be visible');
        
        // 強制的に最前面に移動
        modal.style.zIndex = '9999';
    } else {
        console.error('Filter modal not found!');
    }
}

// フィルターモーダルを閉じる
window.closeFilterModal = function closeFilterModal() {
    console.log('closeFilterModal called');
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        console.log('Filter modal closed');
    }
}

// フィルターをクリア
window.clearFilters = function clearFilters() {
    document.getElementById('attendeeOnlyFilter').checked = false;
    document.getElementById('confirmedOnlyFilter').checked = false;
}

// フィルターを適用
window.applyFilters = function applyFilters() {
    attendeeOnlyFilter = document.getElementById('attendeeOnlyFilter').checked;
    confirmedOnlyFilter = document.getElementById('confirmedOnlyFilter').checked;
    
    console.log('Applying filters - attendeeOnly:', attendeeOnlyFilter);
    
    // フィルター変更時にデータを更新
    updateFilteredStaffData();
    renderCalendar(); // renderCalendar内でrenderStaffList()も実行される
    closeFilterModal();
}

// 期間ナビゲーション
function navigatePeriod(direction) {
    if (currentViewType === 'month') {
        currentDate.setMonth(currentDate.getMonth() + direction);
    } else if (currentViewType === 'week') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (currentViewType === 'day') {
        currentDate.setDate(currentDate.getDate() + direction);
    }
    
    setCurrentMonth();
    renderCalendar();
}

// カスタム範囲モーダルの表示
function showCustomRangeModal() {
    const modal = document.getElementById('customRangeModal');
    modal.style.display = 'block';
    
    // 現在の日付から開始
    const today = new Date();
    renderCustomCalendars(today);
    
    // 範囲選択をリセット
    customRangeStartDate = null;
    customRangeEndDate = null;
    isSelectingRange = false;
}

// カスタムカレンダーの描画
function renderCustomCalendars(baseDate) {
    const leftDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const rightDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
    
    renderCustomCalendar('leftCalendar', leftDate);
    renderCustomCalendar('rightCalendar', rightDate);
    
    // 月タイトルの更新
    document.getElementById('leftMonthTitle').textContent = `${leftDate.getMonth() + 1}月 ${leftDate.getFullYear()}`;
    document.getElementById('rightMonthTitle').textContent = `${rightDate.getMonth() + 1}月 ${rightDate.getFullYear()}`;
}

// 個別カスタムカレンダーの描画
function renderCustomCalendar(containerId, date) {
    const container = document.getElementById(containerId);
    const gridId = containerId.replace('Calendar', 'CalendarGrid');
    const grid = document.getElementById(gridId);
    
    grid.innerHTML = '';
    
    // 曜日ヘッダー
    const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // 月の最初の日と最後の日
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // カレンダーの日付を生成
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const dayElement = createCustomCalendarDay(currentDate, date.getMonth());
        grid.appendChild(dayElement);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

// カスタムカレンダーの日付セル作成
function createCustomCalendarDay(date, currentMonth) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = date.getDate();
    
    if (date.getMonth() !== currentMonth) {
        day.classList.add('other-month');
    }
    
    // クリックイベント
    day.addEventListener('click', function() {
        handleCustomDateClick(new Date(date));
    });
    
    return day;
}

// カスタム日付クリックハンドラー
function handleCustomDateClick(date) {
    if (!isSelectingRange) {
        // 開始日を選択
        customRangeStartDate = date;
        customRangeEndDate = null;
        isSelectingRange = true;
    } else {
        // 終了日を選択
        if (date < customRangeStartDate) {
            customRangeEndDate = customRangeStartDate;
            customRangeStartDate = date;
        } else {
            customRangeEndDate = date;
        }
        isSelectingRange = false;
    }
    
    updateCustomCalendarSelection();
}

// カスタムカレンダーの選択状態更新
function updateCustomCalendarSelection() {
    const allDays = document.querySelectorAll('.calendar-day');
    
    allDays.forEach(day => {
        day.classList.remove('selected', 'range-start', 'range-end', 'in-range');
        
        const dayDate = new Date(parseInt(day.dataset.year || new Date().getFullYear()), 
                                parseInt(day.dataset.month || new Date().getMonth()), 
                                parseInt(day.textContent));
        
        if (customRangeStartDate && dayDate.getTime() === customRangeStartDate.getTime()) {
            day.classList.add('range-start');
        } else if (customRangeEndDate && dayDate.getTime() === customRangeEndDate.getTime()) {
            day.classList.add('range-end');
        } else if (customRangeStartDate && customRangeEndDate && 
                   dayDate > customRangeStartDate && dayDate < customRangeEndDate) {
            day.classList.add('in-range');
        }
    });
}

// カスタム範囲モーダルを閉じる
window.closeCustomRangeModal = function closeCustomRangeModal() {
    const modal = document.getElementById('customRangeModal');
    modal.style.display = 'none';
    
    // ビュータイプを月に戻す
    document.getElementById('viewType').value = 'month';
    currentViewType = 'month';
}

// カスタム範囲を適用
window.applyCustomRange = function applyCustomRange() {
    if (customRangeStartDate && customRangeEndDate) {
        calendarStartDate = new Date(customRangeStartDate);
        calendarEndDate = new Date(customRangeEndDate);
        currentViewType = 'custom';
        
        updatePeriodDisplay();
        renderCalendar();
        closeCustomRangeModal();
    } else {
        alert('開始日と終了日を選択してください。');
    }
}

// モーダル背景クリックで閉じる
document.addEventListener('click', function(e) {
    const customModal = document.getElementById('customRangeModal');
    const filterModal = document.getElementById('filterModal');
    
    if (e.target === customModal) {
        closeCustomRangeModal();
    }
    if (e.target === filterModal) {
        closeFilterModal();
    }
    
    // モーダル閉じるボタン
    if (e.target.classList.contains('modal-close')) {
        // どのモーダルの閉じるボタンかを判別
        const parentModal = e.target.closest('.modal');
        if (parentModal && parentModal.id === 'filterModal') {
            closeFilterModal();
        } else if (parentModal && parentModal.id === 'customRangeModal') {
            closeCustomRangeModal();
        }
    }
});