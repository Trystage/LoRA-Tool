document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const messageDiv = document.getElementById('message');
    const typeInput = document.getElementById('type');
    const typeOptions = document.getElementById('type-options');

    // 加载类型列表（即 data/ 下现有的 .json 文件名）
    async function loadTypes() {
        try {
            const response = await fetch('/api/types');
            const types = await response.json();
            typeOptions.innerHTML = '';
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                typeOptions.appendChild(option);
            });
        } catch (error) {
            console.error('加载类型列表失败:', error);
        }
    }

    loadTypes();

    // 表单提交
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const type = typeInput.value.trim();
        if (!type) {
            showMessage('请输入类型（即数据集文件名）', 'error');
            return;
        }

        const instruction = document.getElementById('instruction').value.trim();
        const input = document.getElementById('input').value.trim();
        const output = document.getElementById('output').value.trim();

        if (!instruction || !output) {
            showMessage('请填写必填字段（指令和回答）', 'error');
            return;
        }

        const data = {
            type: type,           // 作为文件名，后端会取出并删除
            instruction: instruction,
            input: input,
            output: output
        };

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                showMessage(`✅ ${result.message}`, 'success');
                // 清空 instruction、input、output，但保留 type（方便连续录入同一文件）
                document.getElementById('instruction').value = '';
                document.getElementById('input').value = '';
                document.getElementById('output').value = '';
                // 重新加载类型列表（因为可能新增了文件）
                loadTypes();
            } else {
                showMessage('❌ 保存失败：' + result.message, 'error');
            }
        } catch (error) {
            showMessage('❌ 网络错误，请稍后重试', 'error');
            console.error(error);
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }
});
