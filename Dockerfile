FROM python:3.12.3
WORKDIR /app
COPY . .
RUN pip install flask
CMD ["python", "app.py"]
