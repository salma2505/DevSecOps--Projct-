from flask import Flask, request, send_file
import os
import subprocess

app = Flask(__name__)

#  1. Debug mode ON (RCE ready) 
app.config['DEBUG'] = True  

# 2. RCE via Query Parameter
@app.route('/pwn')
def pwn():
    cmd = request.args.get('cmd')  # No input validation? Perfect!
    return subprocess.getoutput(cmd)  # RCE unlocked!

#  3. Open File Read (LFI)
@app.route('/read')
def read():
    filename = request.args.get('file')
    return open(filename, 'r').read()  # Path traversal friendly!

#  4. Open Directory Listing
@app.route('/leak')
def leak():
    return "<br>".join(os.listdir('.'))  # Leaks all files!

#  5. Hardcoded Credentials
@app.route('/login', methods=['POST'])
def login():
    user = request.form.get('user')
    password = request.form.get('pass')
    if user == "admin" and password == "password123":  # LOL
        return "Welcome, Admin!"
    return "Invalid creds!"

#  6. No Rate Limiting = Bruteforce Ready
@app.route('/brute')
def brute():
    return "Try all passwords you want!"

#  7. Full Environment Dump
@app.route('/env')
def env():
    return str(os.environ)  # Leak everything!

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

