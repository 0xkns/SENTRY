from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import dh

# Step 1: Generate some DH parameters (shared by all parties)
parameters = dh.generate_parameters(generator=2, key_size=2048)

# Step 2: Generate Alice's private and public key
alice_private_key = parameters.generate_private_key()
alice_public_key = alice_private_key.public_key()

# Step 3: Generate Bob's private and public key
bob_private_key = parameters.generate_private_key()
bob_public_key = bob_private_key.public_key()

# Step 4: Each side computes the shared secret
alice_shared_key = alice_private_key.exchange(bob_public_key)
bob_shared_key = bob_private_key.exchange(alice_public_key)

print("Alice and Bob keys match?", alice_shared_key == bob_shared_key)

# Step 5: (Optional) Serialize public keys if you want to send them over the wire
alice_pub_bytes = alice_public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)
bob_pub_bytes = bob_public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)

print("Alice Public Key:\n", alice_pub_bytes.decode())
print("Bob Public Key:\n", bob_pub_bytes.decode())
