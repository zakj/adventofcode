from fractions import Fraction

type Matrix[T: int | Fraction] = list[list[T]]


def mprint(matrix: Matrix) -> None:
    n = len(matrix[0])
    widths = [
        max(len(str(matrix[row][col])) for row in range(len(matrix)))
        for col in range(n)
    ]
    for row in matrix:
        coeffs = "  ".join(f"{val!s:>{widths[i]}}" for i, val in enumerate(row[:-1]))
        result = f"{row[-1]!s:>{widths[-1]}}"
        print(f"{coeffs} | {result}")


# <https://en.wikipedia.org/wiki/Gaussian_elimination>
# <https://agmath.github.io/Austin_ULA_Python/sec-finding-solutions.html>
def to_reduced_row_echelon_form(matrix: Matrix) -> Matrix[Fraction]:
    # Assumes an augmented matrix (last column is the solution vector).
    #
    # Row echelon form: the leading (leftmost, non-zero) item in each row is to
    # the right of the leading entry of every row above it.
    # Reduced row echelon form: The above, plus each leading entry is 1, and is
    # the only non-zero entry in its column.
    #
    # Safe operations on the matrix:
    # - swap two rows
    # - multiply a row by a non-zero scalar
    # - add a scalar multiple of one row to another

    matrix = [[Fraction(x) for x in row] for row in matrix]
    m = len(matrix)
    n = len(matrix[0])

    row = 0
    for col in range(n - 1):
        # ensure a non-zero value in the pivot column by swapping rows
        # if no non-zero values exist in the column, move to next column
        pivot = matrix[row][col]
        if pivot == 0:
            _, new_row = max((abs(matrix[y][col]), y) for y in range(row, m))
            pivot = matrix[new_row][col]
            if pivot == 0:
                continue
            matrix[row], matrix[new_row] = matrix[new_row], matrix[row]

        # set the pivot to 1 and normalize the pivot row
        if pivot != 1:
            for x in range(col, n):
                matrix[row][x] /= pivot

        # eliminate every value above and below the pivot
        # values to the left of the pivot will already be 0
        for y in range(m):
            if y == row:
                continue
            factor = matrix[y][col]
            if factor:
                for x in range(col, n):
                    matrix[y][x] -= matrix[row][x] * factor

        row += 1
        if row >= m:
            break

    return matrix
