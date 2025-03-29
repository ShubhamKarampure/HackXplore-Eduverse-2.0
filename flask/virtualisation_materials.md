---
marp: true
theme: gaia
paginate: true
backgroundColor: "#1E1E2E"
color: white

---
### Virtualization

---
marp=true
theme=default
---
# Virtualization: An Introduction (T123)

*   Based on: "Cloud Computing: Theory and Practice" by Dan C. Marinescu
*   Virtualization is a key technology in cloud computing.
*   It separates hardware from software for better system efficiency.
*   A 2009 Gartner report identified virtualization as a top strategic technology.

---
# The Core Idea

*   Traditional systems: Host OS directly manages hardware.
*   Virtualization: Multiple guest OSs run on the same hardware, independent of the host OS.
*   This is achieved by adding a *virtualization layer*.

---
# Virtualization Layer: The Hypervisor

*   The virtualization layer is also known as the *hypervisor* or *Virtual Machine Monitor (VMM)*.
*   It manages the VMs.
*   It converts real hardware into virtual hardware.
*   Allows different OSs (e.g., Linux, Windows) to run simultaneously on the same physical machine.

---
# Levels of Virtualization Implementation

*   **Hardware Abstraction Level:** Virtualization directly on bare hardware.
    *   Creates a virtual hardware environment for VMs.
    *   Manages underlying hardware.
    *   Aims to improve hardware utilization by multiple users.
    *   Example: Xen hypervisor.

---
# Levels of Virtualization Implementation (cont.)

*   **Operating System Level:** Abstraction layer between OS and applications.
    *   Creates isolated containers on a single physical server.
    *   OS instances utilize the hardware.

---
# Hypervisor Architecture

*   Hypervisor sits directly between hardware and OS.
*   Supports hardware-level virtualization.
*   Manages CPU, memory, disk, and network interfaces.

---
# Types of Virtualization Architectures

*   **Hypervisor Architecture:** Described previously.
*   **Paravirtualization:** Guest OS is modified to cooperate with the hypervisor.
*   **Host-Based Virtualization:** Virtualization layer runs on top of a host OS.

---
# Examples of Virtualization Technologies

*   **VMware Workstation:** Host-based virtualization.
*   **Xen:** Hypervisor for various architectures (IA-32, x86-64, Itanium, PowerPC). Can modify Linux to act as a hypervisor.
*   **KVM (Kernel-based Virtual Machine):** Linux kernel virtualization infrastructure. Supports hardware-assisted virtualization and paravirtualization.

---
# KVM and VirtIO

*   KVM uses Intel VT-x or AMD-v for hardware-assisted virtualization.
*   It uses VirtIO framework for paravirtualization.
*   VirtIO includes:
    *   Paravirtual Ethernet card
    *   Disk I/O controller
    *   Balloon device (memory management)
    *   VGA graphics interface

---
# Benefits of Virtualization

*   Improved resource utilization.
*   Application flexibility.
*   Better system efficiency.
*   Enlarged memory space (virtual memory).
*   Enhanced use of compute engines, networks, and storage.

