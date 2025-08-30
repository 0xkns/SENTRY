import numpy as np


def generate_scramble_matrix(dim: int) -> np.ndarray:
    """Generate a random invertible matrix for scrambling embeddings"""
    matrix = np.random.randn(dim, dim)
    while np.linalg.det(matrix) == 0:
        matrix = np.random.randn(dim, dim)
    return matrix
