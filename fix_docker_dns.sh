#!/bin/bash
# Fix Docker DNS inside the VM
cat > /etc/docker/daemon.json << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
EOF
systemctl restart docker
sleep 3
echo "Docker DNS fixed!"
docker info | grep -i dns || echo "DNS not shown in info but daemon restarted"
