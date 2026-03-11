from flask import Flask, request, jsonify, render_template
import os
import json

app = Flask(__name__)

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

def get_file_path(filename):
    """确保文件名以 .json 结尾，并返回完整路径"""
    if not filename.endswith('.json'):
        filename += '.json'
    return os.path.join(DATA_DIR, filename)

def load_data(filename):
    filepath = get_file_path(filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data, filename):
    filepath = get_file_path(filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/types", methods=["GET"])
def get_types():
    """返回 data/ 目录下所有 .json 文件的 basename（去掉扩展名）"""
    files = []
    for f in os.listdir(DATA_DIR):
        if f.endswith('.json'):
            files.append(os.path.splitext(f)[0])  # 去掉 .json 后缀
    return jsonify(sorted(files))

@app.route("/api/save", methods=["POST"])
def save_entry():
    """保存一条新数据到 type 对应的文件（type 作为文件名，不存入数据）"""
    new_entry = request.get_json()
    # 从数据中取出 type 作为文件名，并删除该字段
    filename = new_entry.pop('type', None)
    if not filename:
        return jsonify({"status": "error", "message": "类型不能为空"}), 400
    if not new_entry.get("instruction"):
        return jsonify({"status": "error", "message": "instruction 不能为空"}), 400

    data = load_data(filename)
    data.append(new_entry)
    save_data(data, filename)
    return jsonify({"status": "success", "message": f"保存到成功"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6098, debug=True)
