import paramiko, base64
import config

def update_client(client_config):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    ip, username, password = client_config

    client.connect(ip, username=username, password=password)

    download_command = 'curl -LO %s' % (config.archive_url,)
    _exec_command(client, download_command)
    _exec_command(client, 'rm -rf candle-master')
    _exec_command(client, 'unzip master.zip')

    client.close()

def _exec_command(client, command):
    stdin, stdout, stderr = client.exec_command(command)

    print "STDOUT: "
    for line in stdout:
        if line:
            print line.strip('\n')

    print "STDERR: "
    for line in stderr:
        if line:
            print line.strip('\n')

if __name__=='__main__':
    for client_config in config.clients:
        update_client(client_config)
