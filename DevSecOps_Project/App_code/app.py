from flask import Flask, escape
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'
csrf = CSRFProtect(app)
Talisman(app)

@app.route('/')
def home():
    return "Welcome to the Flask DevSecOps App!"

@app.route('/<name>')
def hello(name):
    return f"Hello {escape(name)}!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)


