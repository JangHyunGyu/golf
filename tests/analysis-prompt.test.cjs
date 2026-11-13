'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadConfig(file) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const start = html.indexOf('const ANALYSIS_CONFIG');
    const end = html.indexOf('</script>', start);
    assert.ok(start >= 0 && end > start, `${file} must define ANALYSIS_CONFIG`);
    return vm.runInNewContext(`${html.slice(start, end)}\nANALYSIS_CONFIG`);
}

const pages = [
    {
        file: 'analysis.html',
        focus: {
            Driver: '비거리와 방향성',
            Iron: '정확한 임팩트와 거리 조절',
            Wedge: '스핀 컨트롤과 정확성',
            WoodHybrid: '쓸어 치는 타격과 탄도 확보',
        },
    },
    {
        file: 'analysis-en.html',
        focus: {
            Driver: 'Distance and Direction',
            Iron: 'Precise Impact and Distance Control',
            Wedge: 'Spin Control and Accuracy',
            WoodHybrid: 'Sweeping Impact and Trajectory',
        },
    },
    {
        file: 'analysis-jp.html',
        focus: {
            Driver: '飛距離と方向性',
            Iron: '正確なインパクトと距離感',
            Wedge: 'スピンコントロールと正確性',
            WoodHybrid: '払い打つ打撃と弾道の確保',
        },
    },
];

for (const page of pages) {
    test(`${page.file} sends the selected club and its focus to the model`, () => {
        const generatePrompt = loadConfig(page.file).generatePrompt;
        for (const [club, phrase] of Object.entries(page.focus)) {
            const prompt = generatePrompt(club);
            assert.equal(prompt.includes('${club}'), false, `${club} placeholder must be replaced`);
            assert.equal(prompt.includes('${clubFocus}'), false, `${club} focus placeholder must be replaced`);
            assert.ok(prompt.includes(club), `${club} name must be in the prompt`);
            assert.ok(prompt.includes(phrase), `${club} focus must be in the prompt`);
            for (const [other, otherPhrase] of Object.entries(page.focus)) {
                if (other === club) continue;
                assert.equal(prompt.includes(otherPhrase), false, `${club} prompt must not include ${other} focus`);
            }
        }
    });
}
