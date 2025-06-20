// シフト管理JavaScript - 参考画像通りの機能実装

// グローバル変数
let currentDate = new Date();
let viewType = 'month';
let attendeeOnlyFilter = false;
let confirmedOnlyFilter = false;

// 業務管理との連携用
let businessData = [];

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

// 業務データを読み込み
function loadBusinessData() {
    try {
        const data = localStorage.getItem('businessManagementData');
        if (data) {
            businessData = JSON.parse(data);
            console.log('業務データ読み込み完了:', businessData);
        } else {
            // サンプル業務データを作成（テスト用）
            businessData = [
                {
                    id: 'business_sample_1',
                    label: 'ホール',
                    color: '#007bff',
                    description: 'フロアサービス業務',
                    startTime: '10:00',
                    endTime: '22:00',
                    breakTime: '1:00'
                },
                {
                    id: 'business_sample_2',
                    label: 'キッチン',
                    color: '#28a745',
                    description: '厨房業務',
                    startTime: '09:00',
                    endTime: '21:00',
                    breakTime: '1:00'
                }
            ];
            console.log('サンプル業務データを作成:', businessData);
        }
    } catch (error) {
        console.error('業務データ読み込みエラー:', error);
        businessData = [];
    }
}

// シフトデータの初期化
let shiftData = initializeShiftData();

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('シフト管理画面初期化開始');
    
    // スタッフデータを最新に更新
    staffData = getStaffData();
    shiftData = initializeShiftData();
    
    // 業務データを読み込み
    loadBusinessData();
    
    initializeCalendar();
    setupEventListeners();
    setupShiftEditListeners();
    renderShiftTable();
    
    console.log('シフト管理画面初期化完了');
    console.log('使用スタッフデータ:', staffData);
    console.log('使用業務データ:', businessData);
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
            
        case 'custom':
            // カスタム期間表示
            if (customRangeStartDate && customRangeEndDate) {
                const start = new Date(customRangeStartDate);
                const end = new Date(customRangeEndDate);
                
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    dates.push({
                        date: d.getDate(),
                        day: d.getDay(),
                        fullDate: `${d.getMonth() + 1}/${d.getDate()}`,
                        month: d.getMonth() + 1,
                        year: d.getFullYear(),
                        isToday: isToday(d)
                    });
                }
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
    
    // 業務行（人件費の直下に追加）
    businessData.forEach(business => {
        html += '<tr class="business-row">';
        html += `<td class="business-label" style="background-color: ${business.color}; color: white; font-weight: 500; padding: 6px 12px;">${business.label}</td>`;
        dates.forEach(dateInfo => {
            const requiredCount = getRequiredStaffCount(business, dateInfo);
            const assignedCount = getAssignedStaffCount(business, dateInfo);
            const todayColumnClass = dateInfo.isToday ? ' today-column' : '';
            
            let displayText = '';
            let textColor = '';
            if (requiredCount > 0) {
                displayText = `${assignedCount}/${requiredCount}`;
                // 人数が足りていない場合は赤色にする
                if (assignedCount < requiredCount) {
                    textColor = 'color: red;';
                }
            }
            
            html += `<td class="${todayColumnClass}" style="font-family: 'Yu Gothic', sans-serif; font-weight: bold; text-align: center; ${textColor}">${displayText}</td>`;
        });
        html += '</tr>';
    });
    
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
    let filteredData = staffData;
    
    // 出勤者のみフィルター適用
    if (attendeeOnlyFilter) {
        filteredData = filteredData.filter(staff => {
            return hasShiftInCurrentPeriod(staff.name);
        });
    }
    
    // 確定者のみフィルター適用
    if (confirmedOnlyFilter) {
        filteredData = filteredData.filter(staff => {
            return hasConfirmedShiftInCurrentPeriod(staff.name);
        });
    }
    
    return filteredData;
}

// 現在の期間にシフトがあるかチェック
function hasShiftInCurrentPeriod(staffName) {
    const dates = generateDateRange();
    return dates.some(dateInfo => hasShiftOnDate(staffName, dateInfo.fullDate));
}

// 現在の期間に確定シフトがあるかチェック
function hasConfirmedShiftInCurrentPeriod(staffName) {
    const dates = generateDateRange();
    return dates.some(dateInfo => hasConfirmedShiftOnDate(staffName, dateInfo.fullDate));
}

// 特定日に確定シフトがあるかチェック
function hasConfirmedShiftOnDate(staffName, dateString) {
    console.log('hasConfirmedShiftOnDate called:', staffName, dateString);
    
    const shifts = getShiftData();
    if (!shifts[staffName]) {
        console.log('No shifts for staff:', staffName);
        return false;
    }
    
    const [month, date] = dateString.split('/');
    const currentYear = currentDate.getFullYear();
    const shiftKey = `${currentYear}-${month}-${date}`;
    
    console.log('Checking confirmed shiftKey:', shiftKey);
    
    if (shifts[staffName][shiftKey]) {
        const shift = shifts[staffName][shiftKey];
        const isConfirmed = shift.confirmed === true;
        console.log('Found shift, confirmed status:', isConfirmed, shift);
        return isConfirmed;
    }
    
    console.log('No shift found for confirmed check:', staffName, shiftKey);
    return false;
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

// 業務の必要人数を取得（曜日別設定）
function getRequiredStaffCount(business, dateInfo) {
    // 業務管理で設定された曜日別必要人数を取得
    // 曜日: 0=日曜日, 1=月曜日, ..., 6=土曜日
    const dayOfWeek = dateInfo.day;
    
    // 業務管理で実際に設定された曜日別必要人数を使用
    if (business.weeklyRequiredStaff && business.weeklyRequiredStaff[dayOfWeek] !== undefined) {
        return parseInt(business.weeklyRequiredStaff[dayOfWeek]) || 0;
    }
    
    // 設定されていない場合は0を返す
    return 0;
}

// 業務に配置されたスタッフ数を取得
function getAssignedStaffCount(business, dateInfo) {
    const shifts = getShiftData();
    const [month, date] = dateInfo.fullDate.split('/');
    const currentYear = currentDate.getFullYear();
    const shiftKey = `${currentYear}-${month}-${date}`;
    
    let count = 0;
    const filteredStaff = getFilteredStaff();
    
    filteredStaff.forEach(staff => {
        if (shifts[staff.name] && shifts[staff.name][shiftKey]) {
            const shift = shifts[staff.name][shiftKey];
            // シフトに業務が指定されている場合
            if (shift && shift.business === business.id) {
                count++;
            }
        }
    });
    
    return count;
}

// 業務選択肢を設定
function populateBusinessSelect() {
    const select = document.getElementById('businessSelect');
    if (!select) return;
    
    // 既存のオプションをクリア
    select.innerHTML = '<option value="">業務はありません</option>';
    
    // 業務データからオプションを追加
    businessData.forEach(business => {
        const option = document.createElement('option');
        option.value = business.id;
        option.textContent = business.label;
        select.appendChild(option);
    });
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

// カスタム期間選択用変数
let customRangeStartDate = null;
let customRangeEndDate = null;
let isSelectingRange = false;

// カスタム期間モーダル表示
function showCustomRangeModal() {
    console.log('カスタム期間モーダル表示');
    const modal = document.getElementById('customRangeModal');
    if (modal) {
        // 期間選択をリセット
        customRangeStartDate = null;
        customRangeEndDate = null;
        isSelectingRange = false;
        
        // カレンダーを初期化
        initializeCustomCalendars();
        
        modal.style.display = 'block';
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

// カスタムカレンダー初期化
function initializeCustomCalendars() {
    const today = new Date();
    const leftDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const rightDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    renderCustomCalendar('left', leftDate);
    renderCustomCalendar('right', rightDate);
    
    // ナビゲーションイベント
    setupCustomCalendarNavigation();
}

// カスタムカレンダー描画
function renderCustomCalendar(side, date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // タイトル更新
    const titleElement = document.getElementById(`${side}MonthTitle`);
    if (titleElement) {
        titleElement.textContent = `${month + 1}月 ${year}`;
    }
    
    // カレンダーグリッド生成
    const gridElement = document.getElementById(`${side}CalendarGrid`);
    if (!gridElement) return;
    
    // 曜日ヘッダー
    const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
    let html = '';
    
    dayHeaders.forEach(day => {
        html += `<div class="day-header">${day}</div>`;
    });
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    // 前月の日付（空白埋め）
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        html += `<div class="calendar-day other-month" data-date="${year}-${month - 1}-${day}">${day}</div>`;
    }
    
    // 当月の日付
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateString = `${year}-${month}-${day}`;
        const isSelected = isDateInRange(new Date(year, month, day));
        const selectedClass = isSelected ? ' selected' : '';
        html += `<div class="calendar-day${selectedClass}" data-date="${dateString}" onclick="selectCustomDate('${dateString}')">${day}</div>`;
    }
    
    // 次月の日付（空白埋め）
    const remainingCells = 42 - (startDay + lastDay.getDate());
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month" data-date="${year}-${month + 1}-${day}">${day}</div>`;
    }
    
    gridElement.innerHTML = html;
}

// 期間選択処理
function selectCustomDate(dateString) {
    const selectedDate = new Date(dateString);
    
    if (!customRangeStartDate || (customRangeStartDate && customRangeEndDate)) {
        // 新しい選択開始
        customRangeStartDate = selectedDate;
        customRangeEndDate = null;
        isSelectingRange = true;
    } else if (isSelectingRange) {
        // 終了日選択
        if (selectedDate >= customRangeStartDate) {
            customRangeEndDate = selectedDate;
        } else {
            // 開始日より前を選択した場合、入れ替え
            customRangeEndDate = customRangeStartDate;
            customRangeStartDate = selectedDate;
        }
        isSelectingRange = false;
    }
    
    console.log('期間選択:', customRangeStartDate, customRangeEndDate);
    
    // カレンダー再描画
    initializeCustomCalendars();
}

// 日付が選択範囲内かチェック
function isDateInRange(date) {
    if (!customRangeStartDate) return false;
    
    if (!customRangeEndDate) {
        return date.getTime() === customRangeStartDate.getTime();
    }
    
    return date >= customRangeStartDate && date <= customRangeEndDate;
}

// カスタムカレンダーナビゲーション設定
function setupCustomCalendarNavigation() {
    const leftPrev = document.getElementById('leftPrev');
    const rightNext = document.getElementById('rightNext');
    
    if (leftPrev) {
        leftPrev.onclick = () => {
            const currentTitle = document.getElementById('leftMonthTitle').textContent;
            const [monthStr, yearStr] = currentTitle.split(' ');
            const month = parseInt(monthStr) - 1;
            const year = parseInt(yearStr);
            const newDate = new Date(year, month - 1, 1);
            renderCustomCalendar('left', newDate);
        };
    }
    
    if (rightNext) {
        rightNext.onclick = () => {
            const currentTitle = document.getElementById('rightMonthTitle').textContent;
            const [monthStr, yearStr] = currentTitle.split(' ');
            const month = parseInt(monthStr) - 1;
            const year = parseInt(yearStr);
            const newDate = new Date(year, month + 1, 1);
            renderCustomCalendar('right', newDate);
        };
    }
}

// カスタム期間適用
function applyCustomRange() {
    console.log('カスタム期間適用');
    
    if (!customRangeStartDate || !customRangeEndDate) {
        alert('期間を選択してください（開始日と終了日を選択）');
        return;
    }
    
    // 期間を適用
    const startStr = formatDate(customRangeStartDate);
    const endStr = formatDate(customRangeEndDate);
    
    console.log(`カスタム期間設定: ${startStr} - ${endStr}`);
    
    // 期間表示を更新
    const periodDisplay = document.getElementById('periodDisplay');
    if (periodDisplay) {
        periodDisplay.textContent = `${startStr} - ${endStr}`;
    }
    
    // カスタム期間に基づいてテーブル再描画
    viewType = 'custom';
    renderShiftTable();
    
    closeCustomRangeModal();
}

// 日付フォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
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
    
    // 業務選択肢を設定
    populateBusinessSelect();
    
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
    
    // 業務選択をリセット
    const businessSelect = document.getElementById('businessSelect');
    if (businessSelect) {
        businessSelect.value = '';
    }
    
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
        
        // 業務選択を設定
        const businessSelect = document.getElementById('businessSelect');
        if (businessSelect) {
            businessSelect.value = shift.business || '';
        }
        
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
        weeklyRepeat: document.getElementById('weeklyRepeat').checked,
        business: document.getElementById('businessSelect').value || null
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
    
    // 通常のシフト表示（3段構成：業務、時刻、ラベル）
    let content = '';
    
    // 業務情報を取得
    const businessName = getBusinessNameById(shift.business);
    const businessText = businessName || '業務未設定';
    
    // 時刻表示
    const timeText = shift.startTime && shift.endTime ? 
        `${shift.startTime}~${shift.endTime}` : 
        (shift.startTime ? `${shift.startTime}~` : '');
    
    // ラベル表示
    const labelText = shift.label || '';
    
    // シフト情報がある場合の表示
    if (shift.label || shift.startTime || shift.endTime || shift.business) {
        const color = shift.color || '#007bff';
        
        content = `<div class="shift-entry" style="background-color: ${color}; color: white; padding: 2px 3px; border-radius: 3px; font-size: 9px; margin: 1px 0; font-weight: 500; width: 85px; overflow: hidden; line-height: 1.2;">
            <div class="shift-business" style="font-size: 11px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px;">${businessText}</div>
            ${timeText ? `<div class="shift-time" style="font-size: 9px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px;">${timeText}</div>` : ''}
            ${labelText ? `<div class="shift-label" style="font-size: 11px; font-weight: 400; overflow: hidden; text-overflow: ellipsis;">${labelText}</div>` : ''}
        </div>`;
    }
    
    return content;
}

// 業務IDから業務名を取得
function getBusinessNameById(businessId) {
    if (!businessId) return null;
    
    const business = businessData.find(b => b.id === businessId);
    return business ? business.label : null;
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
window.selectCustomDate = selectCustomDate;
window.closeShiftEditModal = closeShiftEditModal;
window.saveShift = saveShift;
window.deleteShift = deleteShift;