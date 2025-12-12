function init() {
    console.log('Initializing Custom Selects...');
    injectCustomStyles();
    setupCustomSelects();
}

function injectCustomStyles() {
    const styleId = 'custom-select-styles';
    if (document.getElementById(styleId)) return;

    const css = `
        .custom-select-modern {
            position: relative;
            display: block !important;
            width: 100% !important;
            margin-top: 8px;
            z-index: 100;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
            opacity: 1 !important;
            visibility: visible !important;
        }

        .custom-select-modern__trigger {
            position: relative;
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            font-size: 1rem;
            font-weight: 500;
            color: #37474f;
            background: #fff;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 56px;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .custom-select-modern__trigger:hover {
            background: #f9fbe7;
            border-color: #4caf50;
            box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
            transform: translateY(-1px);
        }

        .custom-select-modern.open .custom-select-modern__trigger {
            border-color: #2e7d32;
            background: #fff;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
        }

        .custom-select-modern__arrow {
            position: relative;
            height: 10px;
            width: 14px;
            margin-left: 10px;
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .custom-select-modern__arrow::before, .custom-select-modern__arrow::after {
            content: "";
            position: absolute;
            bottom: 0;
            width: 2px;
            height: 100%;
            background-color: #546e7a;
            transition: all 0.3s ease;
            border-radius: 2px;
        }

        .custom-select-modern__arrow::before { 
            left: 2px; 
            height: 8px; 
            transform: rotate(-45deg); 
        }
        
        .custom-select-modern__arrow::after { 
            right: 2px; 
            height: 8px; 
            transform: rotate(45deg); 
        }

        .custom-select-modern.open .custom-select-modern__arrow {
            transform: rotate(180deg);
        }

        .custom-select-modern.open .custom-select-modern__arrow::before,
        .custom-select-modern.open .custom-select-modern__arrow::after {
            background-color: #2e7d32;
        }

        .custom-options-modern {
            position: absolute;
            display: block;
            top: 100%;
            left: 0;
            right: 0;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-top: 0;
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
            background: #fff;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            z-index: 1000;
            transform: translateY(-10px) scale(0.98);
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .custom-select-modern.open .custom-options-modern {
            opacity: 1;
            visibility: visible;
            pointer-events: all;
            transform: translateY(0) scale(1);
        }

        .custom-option-modern {
            position: relative;
            display: flex;
            align-items: center;
            padding: 14px 20px;
            font-size: 0.95rem;
            font-weight: 400;
            color: #37474f;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .custom-option-modern:last-child { 
            border-bottom: none; 
        }

        .custom-option-modern:hover {
            color: #1b5e20;
            background: #f1f8e9;
            padding-left: 24px;
        }

        .custom-option-modern.selected {
            color: #2e7d32;
            background: #e8f5e9;
            font-weight: 600;
        }

        .custom-option-modern.selected::after {
            content: '';
            position: absolute;
            right: 20px;
            width: 6px;
            height: 10px;
            border: solid #2e7d32;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        
        /* Scrollbar for options if too many */
        .custom-options-modern {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .custom-options-modern::-webkit-scrollbar {
            width: 6px;
        }
        
        .custom-options-modern::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02);
        }
        
        .custom-options-modern::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
        }
        
        .custom-options-modern::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 600px) {
            .custom-select-modern {
                margin-top: 6px;
            }
            .custom-select-modern__trigger {
                height: 46px;
                padding: 0 16px;
                font-size: 0.95rem;
                border-radius: 12px;
            }
            .custom-options-modern {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            .custom-option-modern {
                padding: 12px 16px;
                font-size: 0.9rem;
            }
        }
    `;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
    console.log('Injected custom select styles');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function setupCustomSelects() {
    const selects = document.querySelectorAll('.options-grid select');
    
    if (selects.length === 0) {
        console.warn('No selects found in .options-grid');
        return;
    }

    selects.forEach(select => {
        // Check if already initialized
        if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-modern')) {
            return;
        }

        try {
            // Create custom select structure
            const customSelect = document.createElement('div');
            customSelect.className = 'custom-select-modern';
            
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-modern__trigger';
            
            // Initial value
            const selectedOption = select.options[select.selectedIndex];
            trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : ''}</span><div class="custom-select-modern__arrow"></div>`;
            
            const options = document.createElement('div');
            options.className = 'custom-options-modern';
            
            Array.from(select.options).forEach(option => {
                const customOption = document.createElement('div');
                customOption.className = 'custom-option-modern' + (option.selected ? ' selected' : '');
                customOption.dataset.value = option.value;
                customOption.textContent = option.text;
                
                customOption.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Update trigger text
                    trigger.querySelector('span').textContent = this.textContent;
                    
                    // Update original select value
                    select.value = this.dataset.value;
                    
                    // Trigger change event on original select
                    const event = new Event('change', { bubbles: true });
                    select.dispatchEvent(event);
                    
                    // Update selected class
                    options.querySelectorAll('.custom-option-modern').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Close dropdown
                    customSelect.classList.remove('open');
                });
                
                options.appendChild(customOption);
            });
            
            customSelect.appendChild(trigger);
            customSelect.appendChild(options);
            
            // Insert custom select after the original select
            select.insertAdjacentElement('afterend', customSelect);
            
            // Hide original select
            select.style.display = 'none';
            
            // Toggle dropdown
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other open selects
                document.querySelectorAll('.custom-select-modern').forEach(el => {
                    if (el !== customSelect) {
                        el.classList.remove('open');
                    }
                });
                
                customSelect.classList.toggle('open');
            });
        } catch (e) {
            console.error('Error creating custom select:', e);
            select.style.display = ''; // Ensure original is visible on error
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select-modern')) {
            document.querySelectorAll('.custom-select-modern').forEach(el => {
                el.classList.remove('open');
            });
        }
    });
}
