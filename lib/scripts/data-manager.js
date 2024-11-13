let areas = [];
let currentAreaIndex = null;
let currentBuildingIndex = null;
let colorPickers = new Map(); // Store color picker instances
let draggedBuildingIndex = null;
let draggedAreaIndex = null;
let dragOverBuildingCard = null;
let dropZoneListeners = new WeakMap();
let dragSrcBuilding = null;
let dragSrcArea = null;
let dragSrcBuildingIndex = null;

// Add event listener for page reload/exit
window.addEventListener('beforeunload', function(e) {
    // Cancel the event
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = '';
    
    // The message below won't actually be shown in modern browsers
    // Instead, browsers show their own generic message
    return 'Dine ændringer er ikke automatisk gemt. Er du sikker på at du vil forlade siden?';
});

// Optional: Add event listener for internal navigation links
document.addEventListener('click', function(e) {
    // Check if the clicked element is a link
    // if (e.target.tagName === 'A' && !e.target.hasAttribute('download')) {
    //     // Show confirmation dialog
    //     if (!confirm('You may have unsaved changes. Do you want to leave this page?')) {
    //         e.preventDefault();
    //     }
    // }
});


// Initialize the application
function init() {
    // loadAreasFromFile();
    areas = window.areas;
    renderAreas();
}


// Load areas from data.json file
// function loadAreasFromFile() {
//     fetch('../data.json')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Failed to load data.json');
//             }
//             return response.json();
//         })
//         .then(data => {
//             areas = data;
//             renderAreas();
//         })
//         .catch(error => {
//             console.log("XD")
//             showErrorMessage('Error loading data.json: ' + error.message);
//         });
// }


// Show error/success message to user
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    // Determine if this is an error or success message
    const isError = message.toLowerCase().includes('ikke fundet') || 
                   message.toLowerCase().includes('kunne ikke') ||
                   message.toLowerCase().includes('allerede tilføjet') ||
                   message.toLowerCase().includes('der er ingen sider at gemme') ||
                   message.toLowerCase().includes('fejl');
    
    errorDiv.innerHTML = `
        <div class="error-content ${isError ? 'error' : 'success'}">
            <strong>${isError ? '⚠️ Fejl' : '✓ Success'}</strong>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">Luk</button>
        </div>
    `;
    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 10000);
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Check if importing multiple areas or single area
            if (Array.isArray(importedData)) {
                areas = [...areas, ...importedData];
            } else {
                // Single area import
                areas.push(importedData);
            }
            
            renderAreas();
            showErrorMessage('Filen blev importeret!');
        } catch (error) {
            showErrorMessage('Fejl ved at læse fil: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Export functions
function exportArea(areaIndex) {
    const area = areas[areaIndex];
    if (!area) return;
    
    const filename = FileManager.sanitizeFilename(area.areaName);
    const dataStr = JSON.stringify(area, null, 2);
    
    downloadJson(dataStr, `${filename}.json`);
}

function exportAllAreas() {
    if (areas.length === 0) {
        showErrorMessage('Der er ingen sider at gemme');
        return;
    }
    
    const dataStr = "window.areas = " + JSON.stringify(areas, null, 2);
    downloadJson(dataStr, 'data.js');

    showExportGuidance("data")
}

function downloadBackup(){
    if (areas.length === 0) {
        showErrorMessage('Der er ingen sider at backup');
        return;
    }
    
    const date = new Date()
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`
    const dataStr = "window.areas = " + JSON.stringify(areas, null, 2);
    downloadJson(dataStr, `${formattedDate}_backup.js`);

    showBackupGuidance(`${formattedDate}_backup.js`)
}

// Helper function to trigger download
function downloadJson(dataStr, filename) {
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showExportGuidance(filename, buttonText = 'Færdig', nextCallback = null) {
    // Create and show modal
    const guidanceModal = document.createElement('div');
    guidanceModal.className = 'modal';
    guidanceModal.style.display = 'flex';
    
    guidanceModal.innerHTML = `
        <div class="modal-content export-guidance">
            <span class="close" onclick="closeExportGuidance(this.parentElement.parentElement)">&times;</span>
            <h2>Du er næsten i mål!</h2>
            <div class="export-path">
                <p>For at gemme ændringerne skal du flytte den fil, du lige har downloadet:</p>
                <code>${filename}.js</code>

                <p>fra</p>
                
                <div class="folder-path">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <code>Overførsler</code>
                </div>
                <p>over i mappen</p>
                
                <div class="folder-path">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <code>Infoskærm</code>
                </div>
                <p style="font-size:12px;">(for at erstatte den gamle data-fil)</p>

            </div>

            <h4>Husk at filen SKAL hedde "data" for at virke</h4>
                <p>- Højreklik på filen og tryk 'omdøb'</p>
                <p>- Slet eller omdøb den gamle data-fil hvis nødvendigt</p>
                <p>- Vær opmærksom på, at filen ikke hedder data(1)</p>

            <div class="export-actions">
                <button class="primary" onclick="handleExport(this)">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(guidanceModal);
    
    // Store the callback function for next action if provided
    guidanceModal._callback = nextCallback;
}

function showBackupGuidance(filename, buttonText = 'Færdig', nextCallback = null) {
    // Create and show modal
    const guidanceModal = document.createElement('div');
    guidanceModal.className = 'modal';
    guidanceModal.style.display = 'flex';
    
    guidanceModal.innerHTML = `
        <div class="modal-content export-guidance">
            <span class="close" onclick="closeExportGuidance(this.parentElement.parentElement)">&times;</span>
            <h2>Du har downloaded en backup fil!</h2>
            <div class="export-path">
                <p>For at gemme backup'en skal du flytte den fil, du lige har downloadet:</p>
                <code>${filename}</code>

                <p>fra</p>
                
                <div class="folder-path">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <code>Overførsler</code>
                </div>
                <p>over i mappen</p>
                
                <div class="folder-path">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <code>Infoskærm/lib/backups</code>
                </div>
                                <p style="margin-top:80px;">Hvis der nogensinde sker noget med datafilen, kan du bruge denne backup ved at omdøbe til "data" og flytte filen til </p>
                                <div class="folder-path">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H11L9 5H5C3.89543 5 3 5.89543 3 7Z" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <code>Infoskærm</code>
            </div>

            


            <div class="export-actions">
                <button class="primary" onclick="handleExport(this)">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(guidanceModal);
    
    // Store the callback function for next action if provided
    guidanceModal._callback = nextCallback;
}

function handleExport(button) {
    const modal = button.closest('.modal');
    if (modal && modal._callback) {
        modal._callback();
    }
    closeExportGuidance(modal);
}

function closeExportGuidance(modal) {
    if (modal) {
        modal.remove();
    }
}

// Add new area
function addNewArea() {
    const newArea = {
        areaName: "New Area",
        oversigtskort: "",
        elementer: [],
        primaryColor: "#941711",
        primaryColorAlpha: "rgba(148, 23, 17, 0.4)"
    };
    
    areas.push(newArea);
    renderAreas();
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

// Add this function to handle area map preview updates
function updateAreaMapPreview(filename) {
    const preview = document.getElementById('areaMapPreview');
    const dropInstructions = document.querySelector('#areaMapDropZone .drop-instructions');
    
    if (filename) {
        if (preview) {
            preview.src = `billeder/${FileManager.sanitizeFilename(areas[currentAreaIndex].areaName)}/${filename}`;
            preview.style.display = 'block';
        }
        if (dropInstructions) {
            dropInstructions.style.display = 'none';
        }
    } else {
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        if (dropInstructions) {
            dropInstructions.style.display = 'block';
        }
    }
}

// Add these new functions for color management
function updateAreaColors(areaIndex, color) {
    const area = areas[areaIndex];
    if (!area) return;

    // Update the primary color
    area.primaryColor = color;
    
    // Convert hex to RGB for the alpha version
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    area.primaryColorAlpha = `rgba(${r}, ${g}, ${b}, 0.4)`;
    
    // Update the color picker preview
    const preview = document.querySelector(`#colorPreview_${areaIndex}`);
    if (preview) {
        preview.style.backgroundColor = color;
    }
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

// Add new building to area
function addBuilding(areaIndex) {
    //add max number of buildings
    // if (areas[areaIndex].elementer.length >= 20){
    //     showErrorMessage("Fejl: kan ikke tilføje mere end 20 bygninger til samme område")
    //     return;
    // }
    const newBuilding = {
        id: Date.now(),
        navn: "",
        beskrivelse: "",
        billeder: {
            primary: null,
            all: [],
            metadata: {}
        },
        faktaboks: {
            igangsat: "",
            færdigt: "",
            boliger: "",
            erhvervsareal: "",
            typologi: "",
            etager: "",
            bygherre: "",
            arkitekt: ""
        },
        ekstraInfo: [],
        infoCirkelPlacering: "rightTop",
        faktaboksPlacering: "leftBottom",
        x: "50%",
        y: "50%"
    };
    
    areas[areaIndex].elementer.push(newBuilding);
    renderBuildingsGrid(areaIndex); // Use new function instead of updateAreaDisplay
    // hasUnsavedChanges = true;
}

function renderBuildingsGrid(areaIndex) {
    const area = areas[areaIndex];
    const buildingsGrid = document.querySelector(`.area-card:nth-child(${areaIndex + 1}) .buildings-grid`);
    
    if (!buildingsGrid) return;

    buildingsGrid.innerHTML = `
        ${area.elementer.map((building, buildingIndex) => `
            <div class="building-card">
                <div class="building-header">
                    <h3>${building.navn}</h3>
                    <div class="building-actions">
                        <button onclick="openBuildingModal(${areaIndex}, ${buildingIndex})" class="icon-button icon-edit">
                            <svg class="feather feather-edit" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button onclick="deleteBuilding(${areaIndex}, ${buildingIndex})" class="icon-button icon-del">
                            <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                <path fill="currentColor" d="M432 80h-82.38l-34-56.75C306.1 8.827 291.4 0 274.6 0H173.4C156.6 0 141 8.827 132.4 23.25L98.38 80H16C7.125 80 0 87.13 0 96v16C0 120.9 7.125 128 16 128H32v320c0 35.35 28.65 64 64 64h256c35.35 0 64-28.65 64-64V128h16C440.9 128 448 120.9 448 112V96C448 87.13 440.9 80 432 80zM171.9 50.88C172.9 49.13 174.9 48 177 48h94c2.125 0 4.125 1.125 5.125 2.875L293.6 80H154.4L171.9 50.88zM352 464H96c-8.837 0-16-7.163-16-16V128h288v320C368 456.8 360.8 464 352 464zM224 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S208 183.2 208 192v208C208 408.8 215.2 416 224 416zM144 416C152.8 416 160 408.8 160 400V192c0-8.844-7.156-16-16-16S128 183.2 128 192v208C128 408.8 135.2 416 144 416zM304 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S288 183.2 288 192v208C288 408.8 295.2 416 304 416z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="building-description">${building.beskrivelse}</div>
            </div>
        `).join('')}
        <div class="building-card add-building-card" onclick="addBuilding(${areaIndex})">
            <div class="add-building-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Building</span>
            </div>
        </div>
    `;

    // Reinitialize building drag and drop
    initializeBuildingDragDrop();
}

// New function to update area display
function updateAreaDisplay(areaIndex) {
    const area = areas[areaIndex];
    const areaCards = document.querySelectorAll('.area-card');
    const areaCard = areaCards[areaIndex];
    
    if (!areaCard) {
        renderAreas();
        return;
    }

    // Update area name and filename
    const areaTitle = areaCard.querySelector('.area-title');
    if (areaTitle) {
        const titleH2 = areaTitle.querySelector('h2');
        const filenameSpan = areaTitle.querySelector('.filename');
        if (titleH2) titleH2.textContent = area.areaName;
        if (filenameSpan) filenameSpan.textContent = `${FileManager.sanitizeFilename(area.areaName)}.json`;
    }

    // Update buildings grid using the new function
    renderBuildingsGrid(areaIndex);
    
}

// Delete functions
function deleteArea(index) {
    if (confirm('Er du sikker på, at du vil slette denne side? Husk at gemme dine ændringer eller downloade en backup.')) {
        areas.splice(index, 1);
        renderAreas();
    }
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

function deleteBuilding(areaIndex, buildingIndex) {
    if (confirm('Er du sikker på, at du vil slette denne side? Husk at gemme dine ændringer eller downloade en backup.')) {
        areas[areaIndex].elementer.splice(buildingIndex, 1);
        renderAreas();
    }
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

function openColorPicker(areaIndex) {
    const picker = document.getElementById(`colorPicker_${areaIndex}`);
    if (picker) {
        picker.click();
    }
}

// Render areas list
function renderAreas() {
    const container = document.getElementById('areasList');
    if (!container) return;
    
    container.innerHTML = '';
    
    areas.forEach((area, areaIndex) => {
        const areaElement = document.createElement('div');
        areaElement.className = 'area-card';
        
        areaElement.innerHTML = `
            <div class="area-header">
                <div class="area-title">
                    <h2>${area.areaName}</h2>
                    <span class="filename hidden">${FileManager.sanitizeFilename(area.areaName)}.json</span>
                </div>
                <div class="area-actions">
                    <div class="color-picker-container">
                        <label for="colorPicker_${areaIndex}" class="color-picker-label">
                            Farve
                            <div id="colorPreview_${areaIndex}" 
                                 class="color-preview" 
                                 onclick="openColorPicker(${areaIndex})"
                                 style="background-color: ${area.primaryColor || '#941711'}">
                            </div>
                        </label>
                        <input type="color" 
                               id="colorPicker_${areaIndex}" 
                               value="${area.primaryColor || '#941711'}"
                               onchange="updateAreaColors(${areaIndex}, this.value)"
                               class="color-picker">
                    </div>
                    <button onclick="openAreaModal(${areaIndex})" class="icon-button icon-edit">
                        <svg class="feather feather-edit" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="deleteArea(${areaIndex})" class="icon-button icon-del">
                        <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                            <path fill="currentColor" d="M432 80h-82.38l-34-56.75C306.1 8.827 291.4 0 274.6 0H173.4C156.6 0 141 8.827 132.4 23.25L98.38 80H16C7.125 80 0 87.13 0 96v16C0 120.9 7.125 128 16 128H32v320c0 35.35 28.65 64 64 64h256c35.35 0 64-28.65 64-64V128h16C440.9 128 448 120.9 448 112V96C448 87.13 440.9 80 432 80zM171.9 50.88C172.9 49.13 174.9 48 177 48h94c2.125 0 4.125 1.125 5.125 2.875L293.6 80H154.4L171.9 50.88zM352 464H96c-8.837 0-16-7.163-16-16V128h288v320C368 456.8 360.8 464 352 464zM224 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S208 183.2 208 192v208C208 408.8 215.2 416 224 416zM144 416C152.8 416 160 408.8 160 400V192c0-8.844-7.156-16-16-16S128 183.2 128 192v208C128 408.8 135.2 416 144 416zM304 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S288 183.2 288 192v208C288 408.8 295.2 416 304 416z"/>
                        </svg>
                    </button>
                    <button class="hidden" onclick="exportArea(${areaIndex})">Export Area</button>
                </div>
            </div>
            <div class="buildings-grid" data-area-index="${areaIndex}">
                ${area.elementer.map((building, buildingIndex) => `
                    <div class="building-card">
                        <div class="building-header">
                            <h3>${building.navn}</h3>
                            <div class="building-actions">
                                <button onclick="openBuildingModal(${areaIndex}, ${buildingIndex})" class="icon-button icon-edit">
                                    <svg class="feather feather-edit" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button onclick="deleteBuilding(${areaIndex}, ${buildingIndex})" class="icon-button icon-del">
                                    <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                                        <path fill="currentColor" d="M432 80h-82.38l-34-56.75C306.1 8.827 291.4 0 274.6 0H173.4C156.6 0 141 8.827 132.4 23.25L98.38 80H16C7.125 80 0 87.13 0 96v16C0 120.9 7.125 128 16 128H32v320c0 35.35 28.65 64 64 64h256c35.35 0 64-28.65 64-64V128h16C440.9 128 448 120.9 448 112V96C448 87.13 440.9 80 432 80zM171.9 50.88C172.9 49.13 174.9 48 177 48h94c2.125 0 4.125 1.125 5.125 2.875L293.6 80H154.4L171.9 50.88zM352 464H96c-8.837 0-16-7.163-16-16V128h288v320C368 456.8 360.8 464 352 464zM224 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S208 183.2 208 192v208C208 408.8 215.2 416 224 416zM144 416C152.8 416 160 408.8 160 400V192c0-8.844-7.156-16-16-16S128 183.2 128 192v208C128 408.8 135.2 416 144 416zM304 416c8.844 0 16-7.156 16-16V192c0-8.844-7.156-16-16-16S288 183.2 288 192v208C288 408.8 295.2 416 304 416z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="building-description">${building.beskrivelse}</div>
                    </div>
                `).join('')}
                <div class="building-card add-building-card" data-add-building="true">
                    <div class="add-building-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Building</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(areaElement);
    });

    // Add event delegation for the add building button
    container.addEventListener('click', function(e) {
        const addBuildingCard = e.target.closest('.add-building-card');
        if (addBuildingCard) {
            const buildingsGrid = addBuildingCard.closest('.buildings-grid');
            if (buildingsGrid) {
                const areaIndex = buildingsGrid.dataset.areaIndex;
                addBuilding(parseInt(areaIndex));
            }
        }
    });

    // Initialize building drag and drop after rendering
    initializeBuildingDragDrop();
}



function handleDragEnterDropZone(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragOverDropZone(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragLeaveDropZone(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

async function handleBuildingImagesDrop(e) {
    // Ensure we only handle the event once
    if (e.defaultPrevented) return;
    e.preventDefault();
    
    const dt = e.dataTransfer;
    const files = dt.files;
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    const areaFolder = FileManager.sanitizeFilename(areas[currentAreaIndex].areaName);
    
    // Initialize billeder structure if it doesn't exist
    if (!building.billeder) {
        building.billeder = {
            primary: null,
            all: [],
            metadata: {}
        };
    }

    // Initialize metadata if it doesn't exist
    if (!building.billeder.metadata) {
        building.billeder.metadata = {};
    }

    let successCount = 0;
    let errorCount = 0;
    let existingCount = 0;

    // Process each dropped file
    for (let file of files) {
        const filename = file.name;
        const imagePath = `billeder/${areaFolder}/${filename}`;
        
        try {
            // Skip if image already exists in the building's images
            if (building.billeder.all.includes(filename)) {
                existingCount++;
                continue;
            }

            await checkImageExists(imagePath);
            
            // Add new image to the array
            building.billeder.all.push(filename);
            
            // Set as primary if it's the first image
            if (!building.billeder.primary) {
                building.billeder.primary = filename;
            }
            
            // Initialize metadata for new image
            if (!building.billeder.metadata[filename]) {
                building.billeder.metadata[filename] = {
                    description: '',
                    author: '',
                    year: ''
                };
            }
            
            successCount++;
        } catch (error) {
            errorCount++;
            console.error(`Failed to add image: ${filename}`, error);
            showErrorMessage(`
                Billedet "${filename}" blev ikke fundet!<br>
                Være sikker på, at billedet er placeret i:<br>
                <code>billeder/${areaFolder}/</code>
            `);
        }
    }

    // Show summary of what happened
    if (files.length > 0) {
        let message = [];
        if (successCount > 0) {
            message.push(`Tilføjede ${successCount} ny${successCount !== 1 ? 'e' : 't'} billede${successCount !== 1 ? 'r' : ''}`);
        }
        if (existingCount > 0) {
            message.push(`${existingCount} billede${existingCount !== 1 ? 'r' : ''} findes allerede`);
        }
        if (errorCount > 0) {
            message.push(`Kunne ikke tilføje ${errorCount} billede${errorCount !== 1 ? 'r' : ''}`);
        }
        
        if (message.length > 0) {
            showErrorMessage(message.join('<br>'));
        }
    }

    // Re-render the images list once at the end
    renderBuildingImages();
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    e.currentTarget.classList.add('drag-over');
}

function unhighlight(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleAreaMapDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const filename = files[0].name;
        const area = areas[currentAreaIndex];
        const areaFolder = FileManager.sanitizeFilename(area.areaName);
        const imagePath = `billeder/${areaFolder}/${filename}`;
        
        try {
            await checkImageExists(imagePath);
            
            // Image exists, update area data
            area.oversigtskort = filename;
            
            // Update preview using the new function
            updateAreaMapPreview(filename);
            
        } catch (error) {
            showErrorMessage(`
                Billedet "${filename}" blev ikke fundet!<br>
                Være sikker på, at billedet er placeret i:<br>
                <code>billeder/${areaFolder}/</code>
            `);
        }
    }
}

async function handleBuildingImagesDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    const areaFolder = FileManager.sanitizeFilename(areas[currentAreaIndex].areaName);
    
    // Initialize billeder structure if it doesn't exist
    if (!building.billeder) {
        building.billeder = {
            primary: null,
            all: [],
            metadata: {}
        };
    }

    // Initialize metadata if it doesn't exist
    if (!building.billeder.metadata) {
        building.billeder.metadata = {};
    }

    let successCount = 0;
    let errorCount = 0;
    let existingCount = 0;

    // Process each dropped file
    for (let file of files) {
        const filename = file.name;
        const imagePath = `billeder/${areaFolder}/${filename}`;
        
        try {
            // Skip if image already exists in the building's images
            if (building.billeder.all.includes(filename)) {
                existingCount++;
                continue;
            }

            await checkImageExists(imagePath);
            
            // Add new image to the array
            building.billeder.all.push(filename);
            
            // Set as primary if it's the first image
            if (!building.billeder.primary) {
                building.billeder.primary = filename;
            }
            
            // Initialize metadata for new image
            if (!building.billeder.metadata[filename]) {
                building.billeder.metadata[filename] = {
                    description: '',
                    author: '',
                    year: ''
                };
            }
            
            successCount++;
        } catch (error) {
            errorCount++;
            console.error(`Failed to add image: ${filename}`, error);
            showErrorMessage(`
                Billedet "${filename}" blev ikke fundet!<br>
                Være sikker på, at billedet er placeret i:<br>
                <code>billeder/${areaFolder}/</code>
            `);
        }
    }

    console.log("XDs")

    // Show summary of what happened
    if (files.length > 0) {
        let message = [];
        if (successCount > 0) {
            message.push(`Tilføjede ${successCount} ny${successCount !== 1 ? 'e' : 't'} billede${successCount !== 1 ? 'r' : ''}`);
        }
        if (existingCount > 0) {
            message.push(`${existingCount} billede${existingCount !== 1 ? 'r' : ''} findes allerede`);
        }
        if (errorCount > 0) {
            message.push(`Kunne ikke tilføje ${errorCount} billede${errorCount !== 1 ? 'r' : ''}`);
        }
        
        if (message.length > 0) {
            showErrorMessage(message.join('<br>'));
        }
    }

    // Re-render the images list
    renderBuildingImages();
}


// Building modal functions
function openBuildingModal(areaIndex, buildingIndex) {
    currentAreaIndex = areaIndex;
    currentBuildingIndex = buildingIndex;
    const building = areas[areaIndex].elementer[buildingIndex];
    const area = areas[areaIndex];

    // First show the modal so elements exist in DOM
    document.getElementById('buildingModal').style.display = 'block';
    
    // Now set all the form values
    document.getElementById('buildingName').value = building.navn;
    document.getElementById('buildingDescription').value = building.beskrivelse;
    document.getElementById('buildingStarted').value = building.faktaboks.igangsat;
    document.getElementById('buildingCompleted').value = building.faktaboks.færdigt;
    document.getElementById('buildingHousing').value = building.faktaboks.boliger;
    document.getElementById('buildingCommercial').value = building.faktaboks.erhvervsareal;
    document.getElementById('buildingType').value = building.faktaboks.typologi;
    document.getElementById('buildingFloors').value = building.faktaboks.etager;
    document.getElementById('buildingDeveloper').value = building.faktaboks.bygherre;
    document.getElementById('buildingArchitect').value = building.faktaboks.arkitekt;
    document.getElementById('infoCirkelPlacering').value = building.infoCirkelPlacering;
    document.getElementById('faktaboksPlacering').value = building.faktaboksPlacering;
    
    // Render extra info fields
    const extraInfoList = document.getElementById('extraInfoList');
    extraInfoList.innerHTML = '';
    building.ekstraInfo.forEach((info, index) => {
        const div = document.createElement('div');
        div.className = 'extra-info-item';
        div.innerHTML = `
            <input type="text" value="${info}" onchange="updateExtraInfo(${index}, this.value)">
            <button class="delete" onclick="removeExtraInfo(${index})">Remove</button>
        `;
        extraInfoList.appendChild(div);
    });

    // Add map preview after "Position on Map" heading
    const positionHeading = document.querySelector('#buildingModal h3:nth-of-type(3)');
    if (positionHeading) {
        const mapPreviewHTML = `
            <div id="mapPositionGroup" class="form-group">
                <div id="mapPositionContainer" class="map-position-container">
                    <img src="billeder/${FileManager.sanitizeFilename(area.areaName)}/${area.oversigtskort}" 
                        alt="Du har ikke valgt noget oversigtskort. Gå til 'rediger område' for at vælge oversigtskort">
                    <div id="positionDot" class="position-dot"></div>
                </div>
                <div class="position-inputs">
                    <div class="input-group">
                        <label for="buildingX">Afstand fra venstre:</label>
                        <input type="text" id="buildingX" value="${building.x}" readonly>
                    </div>
                    <div class="input-group">
                        <label for="buildingY">Afstand fra toppen:</label>
                        <input type="text" id="buildingY" value="${building.y}" readonly>
                    </div>
                </div>
            </div>
        `;
        positionHeading.insertAdjacentHTML('afterend', mapPreviewHTML);

        // Initialize the position editor after adding it to DOM
        initializeMapPositionEditor();
    }

    // Render building images
    renderBuildingImages();
    
    // Initialize drag and drop
    initializeDragAndDrop();
}

function closeBuildingModal() {
    const modal = document.getElementById('buildingModal');
    const dropZone = document.getElementById('buildingImagesDropZone');
    
    // Clean up drop zone listeners
    if (dropZone && dropZoneListeners.has(dropZone)) {
        const listeners = dropZoneListeners.get(dropZone);
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.removeEventListener(eventName, listeners[eventName]);
            document.body.removeEventListener(eventName, listeners.preventDefault);
        });
        dropZoneListeners.delete(dropZone);
    }

    modal.style.display = 'none';
    currentBuildingIndex = null;
    
    // Clean up map position group
    const mapGroup = document.getElementById('mapPositionGroup');
    if (mapGroup) {
        mapGroup.remove();
    }
}
function saveBuildingChanges() {
    if (currentAreaIndex === null || currentBuildingIndex === null) return;
    
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    
    building.navn = document.getElementById('buildingName').value;
    building.beskrivelse = document.getElementById('buildingDescription').value;
    building.faktaboks.igangsat = document.getElementById('buildingStarted').value;
    building.faktaboks.færdigt = document.getElementById('buildingCompleted').value;
    building.faktaboks.boliger = document.getElementById('buildingHousing').value;
    building.faktaboks.erhvervsareal = document.getElementById('buildingCommercial').value;
    building.faktaboks.typologi = document.getElementById('buildingType').value;
    building.faktaboks.etager = document.getElementById('buildingFloors').value;
    building.faktaboks.bygherre = document.getElementById('buildingDeveloper').value;
    building.faktaboks.arkitekt = document.getElementById('buildingArchitect').value;
    
    const xInput = document.getElementById('buildingX');
    const yInput = document.getElementById('buildingY');
    if (xInput && yInput) {
        building.x = xInput.value;
        building.y = yInput.value;
    }
    
    building.infoCirkelPlacering = document.getElementById('infoCirkelPlacering').value;
    building.faktaboksPlacering = document.getElementById('faktaboksPlacering').value;
    
    closeBuildingModal();
    // Update only the affected area instead of full render
    updateAreaDisplay(currentAreaIndex);
}

// Function to handle real-time area name updates
function handleAreaNameInput(event) {
    if (currentAreaIndex === null) return;
    
    const newName = event.target.value;
    areas[currentAreaIndex].areaName = newName;
    
    // Update the DOM immediately
    updateAreaCardInRealtime(currentAreaIndex);

    // hasUnsavedChanges = true;  // Set flag when changes are made

}

// Function to update a specific area card without re-rendering the entire list
function updateAreaCardInRealtime(areaIndex) {
    const area = areas[areaIndex];
    const areaCards = document.querySelectorAll('.area-card');
    const filename = FileManager.sanitizeFilename(area.areaName);
    
    if (areaCards[areaIndex]) {
        const areaCard = areaCards[areaIndex];
        
        // Update main title and its filename span
        const areaHeader = areaCard.querySelector('.area-header');
        if (areaHeader) {
            const titleDiv = areaHeader.querySelector('.area-title');
            if (titleDiv) {
                const titleH2 = titleDiv.querySelector('h2');
                const filenameSpan = titleDiv.querySelector('.filename');
                
                if (titleH2) titleH2.textContent = area.areaName;
                if (filenameSpan) filenameSpan.textContent = `${filename}.json`;
            }
        }
        
        // Update ALL filename spans within this card
        const allFilenameSpans = areaCard.querySelectorAll('.filename');
        allFilenameSpans.forEach(span => {
            span.textContent = `${filename}.json`;
        });
    }
}

// Area modal functions
function openAreaModal(areaIndex) {
    currentAreaIndex = areaIndex;
    const area = areas[areaIndex];
    
    const editAreaName = document.getElementById('editAreaName');
    editAreaName.value = area.areaName;
    editAreaName.removeEventListener('input', handleAreaNameInput);
    editAreaName.addEventListener('input', handleAreaNameInput);
    
    const preview = document.getElementById('areaMapPreview');
    const dropInstructions = document.querySelector('#areaMapDropZone .drop-instructions');
    
    // Reset the preview and show drop instructions for new areas
    if (!area.oversigtskort) {
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        if (dropInstructions) {
            dropInstructions.style.display = 'block';
        }
    } else {
        if (preview) {
            preview.src = `billeder/${FileManager.sanitizeFilename(area.areaName)}/${area.oversigtskort}`;
            preview.style.display = 'block';
        }
        if (dropInstructions) {
            dropInstructions.style.display = 'none';
        }
    }
    
    document.getElementById('areaModal').style.display = 'block';
    initializeDragAndDrop();
}


function closeAreaModal() {
    const editAreaName = document.getElementById('editAreaName');
    editAreaName.removeEventListener('input', handleAreaNameInput);
    document.getElementById('areaModal').style.display = 'none';
    currentAreaIndex = null;
}

function saveAreaChanges() {
    if (currentAreaIndex === null) return;
    closeAreaModal();
}

// Extra Info functions
function addExtraInfoField() {
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    building.ekstraInfo.push("");
    
    const div = document.createElement('div');
    div.className = 'extra-info-item';
    div.innerHTML = `
        <input type="text" onchange="updateExtraInfo(${building.ekstraInfo.length - 1}, this.value)" placeholder="Info som er relevant for bygningen, fx priser, specielle formål osv...">
        <button class="delete" onclick="removeExtraInfo(${building.ekstraInfo.length - 1})">Fjern</button>
    `;
    document.getElementById('extraInfoList').appendChild(div);
}

function updateExtraInfo(index, value) {
    areas[currentAreaIndex].elementer[currentBuildingIndex].ekstraInfo[index] = value;
}

function removeExtraInfo(index) {
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    building.ekstraInfo.splice(index, 1);
    const extraInfoList = document.getElementById('extraInfoList');
    extraInfoList.innerHTML = '';
    building.ekstraInfo.forEach((info, i) => {
        const div = document.createElement('div');
        div.className = 'extra-info-item';
        div.innerHTML = `
            <input type="text" value="${info}" onchange="updateExtraInfo(${i}, this.value)" placeholder="Info som er relevant for bygningen, fx priser, specielle formål osv...">
            <button class="delete" onclick="removeExtraInfo(${i})">Fjern</button>
        `;
        extraInfoList.appendChild(div);
    });
}

// Building images functions
async function renderBuildingImages() {
    const container = document.getElementById('buildingImagesPreview');
    const dropInstructions = document.querySelector('.drop-instructions');
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    const area = areas[currentAreaIndex];
    
    // Hide drop instructions if there are images
    if (dropInstructions) {
        dropInstructions.style.display = building.billeder && building.billeder.all.length > 0 ? 'none' : 'block';
    }
    
    if (!building.billeder || !building.billeder.all.length) {
        container.innerHTML = '';  // Clear container but keep drop instructions visible
        return;
    }

    const areaNameSafe = FileManager.sanitizeFilename(area.areaName);
    let validImages = [];
    
    // Check each image before rendering
    for (const filename of building.billeder.all) {
        try {
            const imagePath = `billeder/${areaNameSafe}/${filename}`;
            await checkImageExists(imagePath);
            validImages.push(filename);
        } catch (error) {
            console.warn(`Image not found: ${filename}`);
            showErrorMessage(`
                Billedet "${filename}" blev ikke fundet!<br>
                Være sikker på, at billedet er placeret i:<br>
                <code>billeder/${areaNameSafe}/</code>
            `);
            
            // // Remove the invalid image from building.billeder.all
            // const index = building.billeder.all.indexOf(filename);
            // if (index > -1) {
            //     building.billeder.all.splice(index, 1);
            // }
            
            // If it was the primary image, update primary
            if (building.billeder.primary === filename) {
                building.billeder.primary = building.billeder.all[0] || null;
            }
        }
    }
    
    // Now render only the valid images
    // container.innerHTML = validImages.map(filename => {
    container.innerHTML = building.billeder.all.map(filename => {
        const metadata = building.billeder.metadata?.[filename] || {
            description: '',
            author: '',
            year: ''
        };
        
        return `
            <div class="building-image ${filename === building.billeder.primary ? 'primary' : ''}"
                 draggable="true">
                <div class="drag-handle">⋮⋮</div>
                <img src="billeder/${areaNameSafe}/${filename}" 
                     alt="Fejl: kunne ikke finde filen ${filename} i mappen billeder/${areaNameSafe}/"
                     ondragstart="event.preventDefault()">
                <div class="filename">${filename}</div>
                <div class="image-metadata">
                    <div class="metadata-field">
                        <textarea 
                            placeholder="Add image description" 
                            onchange="updateImageMetadata('${filename}', 'description', this.value)"
                        >${metadata.description}</textarea>
                    </div>
                    <div class="metadata-field">
                        <input 
                            type="text" 
                            placeholder="Photographer/Author"
                            value="${metadata.author}"
                            onchange="updateImageMetadata('${filename}', 'author', this.value)"
                        >
                    </div>
                    <div class="metadata-field">
                        <input 
                            type="text" 
                            placeholder="Year"
                            value="${metadata.year}"
                            onchange="updateImageMetadata('${filename}', 'year', this.value)"
                        >
                    </div>
                </div>
                <div class="image-actions">
                    ${filename !== building.billeder.primary ? `
                        <button onclick="setPrimaryImage('${filename}')">Set as Primary</button>
                    ` : '<span class="primary-badge">Primary</span>'}
                    <button class="delete" onclick="removeImage('${filename}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize drag and drop after rendering
    initializeDragReordering();
}

// Add function to update image metadata
function updateImageMetadata(filename, field, value) {
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    
    // Initialize metadata object if it doesn't exist
    if (!building.billeder.metadata) {
        building.billeder.metadata = {};
    }
    
    // Initialize metadata for this image if it doesn't exist
    if (!building.billeder.metadata[filename]) {
        building.billeder.metadata[filename] = {
            description: '',
            author: '',
            year: ''
        };
    }
    
    // Update the specified field
    building.billeder.metadata[filename][field] = value.trim();
    
    // Remove metadata object if all fields are empty
    if (!building.billeder.metadata[filename].description &&
        !building.billeder.metadata[filename].author &&
        !building.billeder.metadata[filename].year) {
        delete building.billeder.metadata[filename];
    }
    // hasUnsavedChanges = true;  // Set flag when changes are made

}

function setPrimaryImage(filename) {
    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    building.billeder.primary = filename;
    renderBuildingImages();
}

function removeImage(filename) {
    if (!confirm('Remove this image from the building?')) return;

    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    
    // Remove from all images
    const index = building.billeder.all.indexOf(filename);
    if (index > -1) {
        building.billeder.all.splice(index, 1);
    }
    
    // Remove metadata
    if (building.billeder.metadata && building.billeder.metadata[filename]) {
        delete building.billeder.metadata[filename];
    }
    
    // If it was the primary image, set a new one
    if (building.billeder.primary === filename) {
        building.billeder.primary = building.billeder.all[0] || null;
    }

    renderBuildingImages();
}
// File name sanitization (used by multiple functions)
const FileManager = {
    sanitizeFilename: function(filename) {
        if (!filename) return 'untitled';
        return filename;
        // return filename.toLowerCase()
        //     .replace(/\s+/g, '-')           // Replace spaces with -
        //     .replace(/[æ]/g, 'ae')          // Replace æ with ae
        //     .replace(/[ø]/g, 'oe')          // Replace ø with oe
        //     .replace(/[å]/g, 'aa')          // Replace å with aa
        //     .replace(/[^a-z0-9-_.]/g, '')   // Remove invalid chars
        //     .replace(/--+/g, '-')           // Replace multiple - with single -
        //     .replace(/^-+|-+$/g, '')        // Remove leading/trailing dashes
        //     || 'untitled';                  // Fallback if empty after sanitization
    }
}


function initializeMapPositionEditor() {
    const mapContainer = document.getElementById('mapPositionContainer');
    const positionDot = document.getElementById('positionDot');
    const xInput = document.getElementById('buildingX');
    const yInput = document.getElementById('buildingY');
    
    let isDragging = false;

    function updatePosition(e) {
        if (!mapContainer) return;
        
        const rect = mapContainer.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Clamp values between 0 and 100
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        
        // Round values for display
        const roundedX = Math.round(x);
        const roundedY = Math.round(y);
        
        // Update dot position
        positionDot.style.left = `${x}%`;
        positionDot.style.top = `${y}%`;
        
        // Update input fields in real time
        if (xInput && yInput) {
            xInput.value = `${roundedX}%`;
            yInput.value = `${roundedY}%`;
        }

        // Update the building data directly
        if (currentAreaIndex !== null && currentBuildingIndex !== null) {
            const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
            building.x = `${roundedX}%`;
            building.y = `${roundedY}%`;
        }
    }

    // Map click handler
    mapContainer.addEventListener('click', function(e) {
        if (e.target === positionDot) return;
        updatePosition(e);
    });

    // Dot drag handlers
    positionDot.addEventListener('mousedown', function(e) {
        isDragging = true;
        e.preventDefault(); // Prevent text selection while dragging
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        updatePosition(e);
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // Initialize dot position from input values
    function initializeDotPosition() {
        if (xInput && yInput) {
            // Remove % from the values and parse as integers
            const x = parseInt(xInput.value) || 50;
            const y = parseInt(yInput.value) || 50;
            positionDot.style.left = `${x}%`;
            positionDot.style.top = `${y}%`;
        }
    }

    initializeDotPosition();
}

// Add drag events to building images preview container
function initializeDragAndDrop() {
    const buildingImagesDropZone = document.getElementById('buildingImagesDropZone');
    const areaMapDropZone = document.getElementById('areaMapDropZone');

    // Clean up and initialize building images drop zone
    if (buildingImagesDropZone) {
        // Remove old listeners if they exist
        if (dropZoneListeners.has(buildingImagesDropZone)) {
            const oldListeners = dropZoneListeners.get(buildingImagesDropZone);
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                buildingImagesDropZone.removeEventListener(eventName, oldListeners[eventName]);
                document.body.removeEventListener(eventName, oldListeners.preventDefault);
            });
        }

        // Create new listeners
        const listeners = {
            preventDefault: (e) => preventDefault(e),
            dragenter: (e) => {
                preventDefault(e);
                if (e.target === buildingImagesDropZone) {
                    buildingImagesDropZone.classList.add('drag-over');
                }
            },
            dragleave: (e) => {
                preventDefault(e);
                if (e.target === buildingImagesDropZone && !buildingImagesDropZone.contains(e.relatedTarget)) {
                    buildingImagesDropZone.classList.remove('drag-over');
                }
            },
            dragover: (e) => preventDefault(e),
            drop: (e) => {
                preventDefault(e);
                buildingImagesDropZone.classList.remove('drag-over');
                if (e.target === buildingImagesDropZone || e.target.closest('#buildingImagesDropZone') === buildingImagesDropZone) {
                    handleBuildingImagesDrop(e);
                }
            }
        };

        // Store new listeners
        dropZoneListeners.set(buildingImagesDropZone, listeners);

        // Add new listeners
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            buildingImagesDropZone.addEventListener(eventName, listeners[eventName]);
            // Only add preventDefault to document.body
            document.body.addEventListener(eventName, listeners.preventDefault);
        });
    }

    // Clean up and initialize area map drop zone
    if (areaMapDropZone) {
        // Remove old listeners if they exist
        if (dropZoneListeners.has(areaMapDropZone)) {
            const oldListeners = dropZoneListeners.get(areaMapDropZone);
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                areaMapDropZone.removeEventListener(eventName, oldListeners[eventName]);
            });
        }

        // Create new listeners
        const listeners = {
            preventDefault: (e) => preventDefault(e),
            dragenter: (e) => {
                preventDefault(e);
                if (e.target === areaMapDropZone) {
                    areaMapDropZone.classList.add('drag-over');
                }
            },
            dragleave: (e) => {
                preventDefault(e);
                if (e.target === areaMapDropZone && !areaMapDropZone.contains(e.relatedTarget)) {
                    areaMapDropZone.classList.remove('drag-over');
                }
            },
            dragover: (e) => preventDefault(e),
            drop: (e) => {
                preventDefault(e);
                areaMapDropZone.classList.remove('drag-over');
                if (e.target === areaMapDropZone) {
                    handleAreaMapDrop(e);
                }
            }
        };

        // Store new listeners
        dropZoneListeners.set(areaMapDropZone, listeners);

        // Add new listeners
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            areaMapDropZone.addEventListener(eventName, listeners[eventName]);
        });
    }
}
let dragSrcElement = null;

function initializeDragReordering() {
    const items = document.querySelectorAll('.building-image');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    dragSrcElement = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const building = areas[currentAreaIndex].elementer[currentBuildingIndex];
    
    // Check if this is a new file being dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // This is a new file drop, handle it like the drop zone
        await handleBuildingImagesDrop(e);
        return;
    }
    
    // If we get here, this is a reordering drop
    if (dragSrcElement !== this) {
        const allImages = Array.from(document.querySelectorAll('.building-image'));
        const srcIndex = allImages.indexOf(dragSrcElement);
        const destIndex = allImages.indexOf(this);

        const movedImage = building.billeder.all[srcIndex];
        
        // Remove from old position and insert at new position
        building.billeder.all.splice(srcIndex, 1);
        building.billeder.all.splice(destIndex, 0, movedImage);

        // Re-render the images
        renderBuildingImages();
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove drag-over class from all items
    const items = document.querySelectorAll('.building-image');
    items.forEach(item => item.classList.remove('drag-over'));
}



// Add this function to initialize drag and drop for buildings
function initializeBuildingDragDrop() {
    const buildingCards = document.querySelectorAll('.building-card');
    buildingCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleBuildingDragStart);
        card.addEventListener('dragover', handleBuildingDragOver);
        card.addEventListener('dragenter', handleBuildingDragEnter);
        card.addEventListener('dragleave', handleBuildingDragLeave);
        card.addEventListener('drop', handleBuildingDrop);
        card.addEventListener('dragend', handleBuildingDragEnd);
    });
}
function handleBuildingDragStart(e) {
    dragSrcBuilding = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
    
    // Find area and building indices
    const areaCard = this.closest('.area-card');
    const areaCards = Array.from(document.querySelectorAll('.area-card'));
    dragSrcArea = areaCards.indexOf(areaCard);
    
    const buildingCards = Array.from(areaCard.querySelectorAll('.building-card'));
    dragSrcBuildingIndex = buildingCards.indexOf(this);
}
function handleBuildingDragEnter(e) {
    this.classList.add('drag-over');
}


function handleBuildingDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}
function handleBuildingDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleBuildingDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    // Only proceed if we're dragging a building
    if (!dragSrcBuilding) return;

    // Get the destination indices
    const destCard = this.closest('.area-card');
    const destAreaIndex = Array.from(document.querySelectorAll('.area-card')).indexOf(destCard);
    const destBuildingIndex = Array.from(destCard.querySelectorAll('.building-card')).indexOf(this);

    // Ensure we have valid indices
    if (dragSrcArea === null || dragSrcBuildingIndex === null || 
        destAreaIndex === null || destBuildingIndex === null) return;

    // Only reorder if dropping on a different building
    if (dragSrcArea === destAreaIndex && dragSrcBuildingIndex !== destBuildingIndex) {
        // Get the array of buildings for this area
        const buildings = areas[destAreaIndex].elementer;
        
        // Remove building from old position
        const [movedBuilding] = buildings.splice(dragSrcBuildingIndex, 1);
        
        // Insert at new position
        buildings.splice(destBuildingIndex, 0, movedBuilding);
        
        // Save changes and update display
        updateAreaDisplay(destAreaIndex);
    }

    // Remove drag-over styling
    this.classList.remove('drag-over');
    return false;
}

function handleBuildingDragEnd(e) {
    // Reset drag state
    dragSrcBuilding = null;
    dragSrcArea = null;
    dragSrcBuildingIndex = null;
    
    // Remove styling classes
    this.classList.remove('dragging');
    document.querySelectorAll('.building-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function getBuildingCard(element) {
    return element.closest('.building-card');
}


// Function to check if image exists
async function checkImageExists(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(false);
        img.src = imagePath;
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);