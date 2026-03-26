const initialData = [
    { id: 1, name: "모나드", role: "세계를 창조하는 신", image: null, categories: ["신", "창조자"], customFields: [ { label: "성별", value: "불명" }, { label: "창조 방식", value: "프로그래밍" } ], sections: [ { title: "개요", content: "프로그래밍을 통해 세계를 창조하는 **신**이다." }, { title: "성격 및 특징", content: "일반적인 상식으로는 이해하기 힘든 ==4차원적인 성격==을 지니고 있다." } ] },
    { id: 2, name: "우에하라 츠바사", role: "학생", image: null, categories: ["인간", "학생"], customFields: [ { label: "성별", value: "남자아이" }, { label: "선호 복장", value: "메이드복" } ], sections: [ { title: "개요", content: "학교에 다니는 귀여운 소년." }, { title: "특징", content: "평소 메이드복을 즐겨 입는 ~~이상한~~ 독특한 취향을 가지고 있다." } ] },
    { id: 3, name: "라니야 샤힌", role: "파이썬/IoT 프로그래머", image: null, categories: ["인간", "프로그래머", "개발자"], customFields: [ { label: "성격", value: "내향적" }, { label: "주력 언어", value: "Python" }, { label: "개발한 AI", value: "RAZIEL" } ], sections: [ { title: "개요", content: "고도의 집중력을 지닌 천재적인 파이썬 및 IoT 시스템 프로그래머." }, { title: "작중 행적 및 AI 개발", content: "자신을 돕는 인공지능 비서 **'RAZIEL'**을 직접 개발하였다.\n\n평소에는 내향적이고 수줍음이 많지만 코딩을 할 때만큼은 ==무서운 집중력==을 보여준다.\n\n> 에헤헤... 나 지금 파이썬 코딩 집중하는 중이니까... 쪼오끔만 조용히 해줄래...? 힝... 부탁할게에~" } ] },
    { id: 4, name: "인티사르 이사", role: "사후세계의 작곡가", image: null, categories: ["사후세계", "작곡가", "여성"], customFields: [ { label: "나이", value: "18세" }, { label: "국적", value: "팔레스타인" } ], sections: [ { title: "개요", content: "사후세계에서 활동하고 있는 천재적인 18세 작곡가 소녀." }, { title: "생애 및 활동", content: "생전에는 대한민국에서 살았던 경험이 있다. 현재는 사후세계의 한 아늑한 카페를 무대로 삼아 아름다운 음악을 작곡하며 사람들을 위로하고 있다." } ] }
];

let characters = [];
let currentImageBase64 = null;
let viewingCharId = null; 
let currentCategoryFilter = null; 
let searchQuery = ''; 

function loadData() {
    const saved = localStorage.getItem('myCharacters');
    if (saved) { characters = JSON.parse(saved); } else { characters = initialData; saveToLocalStorage(); }
    showGallery(); 
}
function saveToLocalStorage() { localStorage.setItem('myCharacters', JSON.stringify(characters)); }

function hideAllViews() {
    document.getElementById('galleryView').style.display = 'none';
    document.getElementById('readView').style.display = 'none';
    document.getElementById('editView').style.display = 'none';
}

function performSearch() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    if (document.getElementById('galleryView').style.display !== 'block') {
        hideAllViews();
        document.getElementById('galleryView').style.display = 'block';
    }
    renderGallery();
}

function filterByCategory(category) { currentCategoryFilter = category; showGallery(); }

function clearFilterAndShowGallery() {
    currentCategoryFilter = null;
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    showGallery();
}

function showGallery() { 
    hideAllViews(); 
    document.getElementById('galleryView').style.display = 'block'; 
    viewingCharId = null; 
    renderGallery(); 
}

function renderGallery() { 
    const grid = document.getElementById('galleryGrid'); 
    const banner = document.getElementById('filterBanner');
    grid.innerHTML = ''; 

    let displayCharacters = characters;

    if (currentCategoryFilter) {
        displayCharacters = displayCharacters.filter(c => c.categories && c.categories.includes(currentCategoryFilter));
        document.getElementById('currentFilterText').textContent = currentCategoryFilter;
        banner.style.display = 'flex';
    } else { banner.style.display = 'none'; }

    if (searchQuery) {
        displayCharacters = displayCharacters.filter(c => {
            const nameMatch = (c.name || '').toLowerCase().includes(searchQuery);
            const roleMatch = (c.role || '').toLowerCase().includes(searchQuery);
            return nameMatch || roleMatch;
        });
    }

    displayCharacters.forEach(char => { 
        const item = document.createElement('div'); 
        item.className = 'gallery-item'; 
        item.onclick = () => loadCharacter(char.id); 
        const imgHtml = char.image ? `<img src="${char.image}" alt="${char.name}">` : `<span style="color: #ccc; font-size: 40px;">👤</span>`; 
        item.innerHTML = `<div class="gallery-img-wrapper">${imgHtml}</div><div class="gallery-info"><div class="gallery-name">${char.name || '이름 없음'}</div><div class="gallery-role">${char.role || '-'}</div></div>`; 
        grid.appendChild(item); 
    }); 
    
    if (displayCharacters.length === 0) {
        grid.innerHTML = '<p style="color: #7f8c8d; padding: 20px;">조건에 맞는 캐릭터가 없습니다.</p>';
    }
}

function parseMarkdown(text) {
    if (!text) return '';
    let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/^(?:&gt;|>)\s?(.*)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    html = html.replace(/==(.+?)==/g, '<mark>$1</mark>');
    return html;
}

function loadCharacter(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    viewingCharId = char.id;

    document.getElementById('readName').textContent = char.name || '이름 없음';
    document.getElementById('readRole').textContent = char.role || '역할 미상';

    const catBox = document.getElementById('readCategoriesBox');
    if (char.categories && char.categories.length > 0) {
        let html = `<span class="category-label">분류:</span>`;
        char.categories.forEach((cat, idx) => {
            html += `<a class="category-tag" onclick="filterByCategory('${cat}')">${cat}</a>`;
            if(idx < char.categories.length - 1) html += `<span class="category-separator">|</span>`;
        });
        catBox.innerHTML = html;
        catBox.style.display = 'flex';
    } else { catBox.style.display = 'none'; }

    const readImage = document.getElementById('readImage');
    if (char.image) {
        readImage.src = char.image; readImage.style.display = 'block';
    } else { readImage.style.display = 'none'; }

    const table = document.getElementById('readCustomFieldsTable');
    table.innerHTML = '';
    if (char.customFields && char.customFields.length > 0) {
        char.customFields.forEach(field => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<th>${field.label}</th><td>${field.value}</td>`;
            table.appendChild(tr);
        });
        table.style.display = 'table';
    } else { table.style.display = 'none'; }

    const tocContainer = document.getElementById('readTocContainer');
    const tocList = document.getElementById('readTocList');
    const sectionsContainer = document.getElementById('readSectionsContainer');
    tocList.innerHTML = ''; sectionsContainer.innerHTML = '';
    
    if (char.sections && char.sections.length > 0) {
        tocContainer.style.display = 'inline-block';
        char.sections.forEach((sec, index) => {
            const secId = `section-${index}`;
            const tocLi = document.createElement('li');
            tocLi.innerHTML = `<a href="javascript:void(0)" onclick="document.getElementById('${secId}').scrollIntoView({behavior: 'smooth'})">${index + 1}. ${sec.title}</a>`;
            tocList.appendChild(tocLi);
            
            const secDiv = document.createElement('div'); secDiv.className = 'wiki-section'; secDiv.id = secId;
            const parsedContent = parseMarkdown(sec.content);
            secDiv.innerHTML = `<h2 class="wiki-section-title">${index + 1}. ${sec.title}</h2><div class="wiki-section-content">${parsedContent}</div>`;
            sectionsContainer.appendChild(secDiv);
        });
    } else { tocContainer.style.display = 'none'; }

    hideAllViews();
    document.getElementById('readView').style.display = 'block';
    document.querySelector('.main-content').scrollTop = 0; 
}

function editCurrentCharacter() { 
    if (!viewingCharId) return; const char = characters.find(c => c.id === viewingCharId); if (!char) return; 
    document.getElementById('charName').value = char.name || ''; 
    document.getElementById('charRole').value = char.role || ''; 
    document.getElementById('charCategories').value = char.categories ? char.categories.join(', ') : '';
    document.getElementById('customFieldsContainer').innerHTML = ''; 
    if (char.customFields) { char.customFields.forEach(field => addCustomField(field.label, field.value)); } 
    document.getElementById('sectionsEditContainer').innerHTML = ''; 
    if (char.sections) { char.sections.forEach(sec => addSectionEditBlock(sec.title, sec.content)); } 
    if (char.image) { document.getElementById('charImagePreview').src = char.image; document.getElementById('charImagePreview').style.display = 'block'; document.getElementById('imagePlaceholder').style.display = 'none'; currentImageBase64 = char.image; } else { resetImagePreview(); } 
    document.getElementById('formTitle').innerText = '📝 문서 편집'; document.getElementById('deleteBtn').style.display = 'inline-block'; hideAllViews(); document.getElementById('editView').style.display = 'block'; 
}

function createNew() { 
    viewingCharId = null; 
    document.getElementById('charName').value = ''; 
    document.getElementById('charRole').value = ''; 
    document.getElementById('charCategories').value = ''; 
    document.getElementById('customFieldsContainer').innerHTML = ''; 
    document.getElementById('sectionsEditContainer').innerHTML = ''; addSectionEditBlock('개요', ''); 
    resetImagePreview(); 
    document.getElementById('formTitle').innerText = '✨ 새 문서 작성'; document.getElementById('deleteBtn').style.display = 'none'; hideAllViews(); document.getElementById('editView').style.display = 'block'; 
}

function addCustomField(label = '', value = '') { const container = document.getElementById('customFieldsContainer'); const row = document.createElement('div'); row.className = 'custom-field-row'; row.innerHTML = `<input type="text" class="label-input" placeholder="항목명" value="${label}"><input type="text" class="value-input" placeholder="내용" value="${value}"><button class="btn-remove-field" onclick="this.parentElement.remove()" title="항목 삭제">❌</button>`; container.appendChild(row); }

function addSectionEditBlock(title = '', content = '') { 
    const container = document.getElementById('sectionsEditContainer'); 
    const block = document.createElement('div'); 
    block.className = 'section-edit-block'; 
    block.innerHTML = `
        <button class="btn-remove-section" onclick="this.parentElement.remove()">삭제</button>
        <input type="text" class="section-title" placeholder="문단 제목" value="${title}">
        <div class="md-help">💡 텍스트 꾸미기: <code>**굵게**</code>, <code>*기울임*</code>, <code>~~취소선~~</code>, <code>==형광펜==</code>, <code>> 인용구</code></div>
        <textarea class="section-content" placeholder="이 문단에 들어갈 내용을 적어주세요...">${content}</textarea>
    `; 
    container.appendChild(block); 
}

function saveCharacter() { 
    const cfRows = document.querySelectorAll('.custom-field-row'); 
    const customFieldsArray = Array.from(cfRows).map(row => ({ label: row.querySelector('.label-input').value.trim(), value: row.querySelector('.value-input').value.trim() })).filter(field => field.label || field.value); 
    const secBlocks = document.querySelectorAll('.section-edit-block'); 
    const sectionsArray = Array.from(secBlocks).map(block => ({ title: block.querySelector('.section-title').value.trim() || '제목 없음', content: block.querySelector('.section-content').value.trim() })).filter(sec => sec.content); 
    
    const catRaw = document.getElementById('charCategories').value;
    const categoriesArray = catRaw.split(',').map(s => s.trim()).filter(s => s !== '');

    const newChar = { 
        name: document.getElementById('charName').value, 
        role: document.getElementById('charRole').value, 
        categories: categoriesArray, 
        image: currentImageBase64, 
        customFields: customFieldsArray, 
        sections: sectionsArray 
    }; 
    
    if (viewingCharId) { 
        const index = characters.findIndex(c => c.id === viewingCharId); 
        if (index !== -1) { characters[index] = { ...characters[index], ...newChar }; } 
    } else { 
        newChar.id = Date.now(); characters.push(newChar); viewingCharId = newChar.id; 
    } 
    saveToLocalStorage(); loadCharacter(viewingCharId); 
}

function cancelEdit() { if (viewingCharId) { loadCharacter(viewingCharId); } else { showGallery(); } }
function deleteCharacter() { if (!viewingCharId) return; if(confirm("정말로 이 문서를 삭제할까요?")) { characters = characters.filter(c => c.id !== viewingCharId); saveToLocalStorage(); showGallery(); } }
function previewImage() { const fileInput = document.getElementById('charImageInput'); const reader = new FileReader(); reader.onload = function(e) { document.getElementById('charImagePreview').src = e.target.result; document.getElementById('charImagePreview').style.display = 'block'; document.getElementById('imagePlaceholder').style.display = 'none'; currentImageBase64 = e.target.result; }; if (fileInput.files[0]) reader.readAsDataURL(fileInput.files[0]); }
function resetImagePreview() { document.getElementById('charImagePreview').src = ''; document.getElementById('charImagePreview').style.display = 'none'; document.getElementById('imagePlaceholder').style.display = 'block'; document.getElementById('charImageInput').value = ''; currentImageBase64 = null; }
function exportData() { if (characters.length === 0) { alert("백업할 데이터가 없습니다."); return; } const dataStr = JSON.stringify(characters, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "my_character_wiki_backup.json"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
function importData(event) { const reader = new FileReader(); reader.onload = function(e) { try { const importedData = JSON.parse(e.target.result); if (Array.isArray(importedData)) { if(confirm("현재 작성된 데이터에 덮어쓰거나 추가됩니다. 계속하시겠습니까?")) { characters = importedData; saveToLocalStorage(); showGallery(); alert("성공적으로 데이터를 복구했습니다!"); } } else { alert("잘못된 형식의 파일입니다."); } } catch (error) { alert("파일을 읽는 중 오류가 발생했습니다."); } event.target.value = ''; }; if (event.target.files[0]) reader.readAsText(event.target.files[0]); }

window.onload = loadData;