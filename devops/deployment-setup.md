
---

# Deployment Setup Guide (DevOps)

This document explains **end-to-end deployment** of the Job Portal Platform using **AWS EC2, Docker, Jenkins, Kubernetes, and Helm**.

The setup follows **real-world DevOps practices** with GitHub as the single source of truth and automated CI/CD.

---

## 1. AWS Account & EC2 Setup

### 1.1 Login to AWS

* Login to AWS Console: [https://aws.amazon.com/console](https://aws.amazon.com/console)
* Go to **EC2 → Instances**
* Click **Launch Instance**

### 1.2 Create EC2 Instance

* **AMI:** Ubuntu Server 22.04 LTS
* **Instance Type:** t2.medium (minimum for Docker + K8s)
* **Key Pair:** Create or use existing (`.pem` file)
* **Security Group:**

  * SSH → Port 22 (My IP)
  * HTTP → Port 80 (Anywhere)
  * HTTPS → Port 443 (Anywhere)
  * Custom TCP → Port 8080 (Jenkins)

Launch the instance.

---

## 2. Connect to EC2 via SSH

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Update system:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 3. Install Docker

```bash
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```

Add user to Docker group:

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

Verify:

```bash
docker --version
```

---

## 4. Install Kubernetes (Single Node Cluster)

### 4.1 Install dependencies

```bash
sudo apt install curl apt-transport-https -y
```

### 4.2 Install kubectl

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

Verify:

```bash
kubectl version --client
```

---

### 4.3 Install Minikube (for single-node cluster)

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Start cluster:

```bash
minikube start --driver=docker
```

Verify:

```bash
kubectl get nodes
```

---

## 5. Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verify:

```bash
helm version
```

---

## 6. Install Jenkins

### 6.1 Install Java

```bash
sudo apt install openjdk-17-jdk -y
```

### 6.2 Install Jenkins

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y
```

Start Jenkins:

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Access Jenkins:

```
http://<EC2_PUBLIC_IP>:8080
```

Get admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## 7. Jenkins Configuration

### 7.1 Install Required Plugins

* Docker Pipeline
* Git
* Kubernetes CLI
* Credentials Binding
* Blue Ocean (optional)

### 7.2 Add Credentials

Go to **Manage Jenkins → Credentials**

Add:

* Docker Hub username & password
* GitHub credentials (if private repo)

---

## 8. Docker Hub Setup

* Create Docker Hub account
* Create repositories:

  * `job-portal-frontend`
  * `job-portal-backend`

Login from EC2:

```bash
docker login
```

---

## 9. Kubernetes Access for Jenkins

Allow Jenkins to run kubectl:

```bash
sudo usermod -aG docker jenkins
sudo usermod -aG microk8s jenkins
sudo systemctl restart jenkins
```

Copy kubeconfig:

```bash
sudo cp -r ~/.kube /var/lib/jenkins/
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

---

## 10. Helm Deployment

### 10.1 Create Kubernetes Secrets (via Helm)

Secrets are defined inside Helm templates:

* MongoDB URI
* JWT Secret
* Cloudinary credentials

Deploy:

```bash
helm install job-portal devops/helm/job-portal
```

Upgrade:

```bash
helm upgrade job-portal devops/helm/job-portal
```

Rollback:

```bash
helm rollback job-portal 1
```

---

## 11. CI/CD Flow (Jenkins)

Pipeline steps:

1. GitHub push triggers Jenkins
2. Jenkins builds Docker images
3. Images pushed to Docker Hub
4. Helm deploys to Kubernetes
5. Kubernetes performs rolling update

---

## 12. Verify Deployment

Check pods:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get svc
```

Access app:

```bash
minikube service frontend-service
```

---

## 13. Health Monitoring & Scaling

Scale pods:

```bash
kubectl scale deployment job-portal-backend --replicas=3
```

Check logs:

```bash
kubectl logs <pod-name>
```

---

## 14. Rollback Strategy

If deployment fails:

```bash
helm rollback job-portal <revision-number>
```

Kubernetes automatically:

* Stops failing pods
* Restores last stable version

---

## 15. Security Best Practices

* Secrets stored in Kubernetes Secrets
* `.env` never committed
* JWT authentication
* Role-based access (Candidate / Recruiter)
* Docker images scanned before push

---

## 16. Summary

This deployment setup demonstrates:

* Real-world CI/CD
* Containerized applications
* Kubernetes orchestration
* Helm-based release management
* Cloud deployment on AWS EC2

---

## 17. Notes

* This is a **single-node cluster for learning/demo**
* Can be extended to **multi-node production clusters**
* Ready for monitoring tools like Prometheus & Grafana

---

