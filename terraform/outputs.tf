data "azurerm_public_ip" "main" {
  name                = azurerm_public_ip.main.name
  resource_group_name = azurerm_resource_group.main.name
  depends_on          = [azurerm_linux_virtual_machine.main]
}

output "instance_public_ip" {
  description = "Public IP address of the Azure VM"
  value       = data.azurerm_public_ip.main.ip_address
}
