

class Node(object):
	def __init__(self, name):
		self.left = None
		self.right = None
		self.name = name

class Tree(object):
	def __init__(self):
		self.root = None

	def addNode(self, name):
		#internal use
		return Node(name)

	def insert(self, root, name):
		#external/internal call to add nodes
		if root == None:
			return self.addNode(name)
		else:
			if root.left == None:
				root.left = self.insert(root.left, name)
			else:
				root.right = self.insert(root.right, name)

			return root

	def build(self, root, path):
		#external/internal call to build from path
		index = 0
		if root == None:
			root = self.addNode(path[index])
			index += 1
		elif root.name == path[index]:
			index += 1
		elif root.name != path[index]:
			raise "More children needed"

		if index < len(path):
			if root.left == None:
				root.left = self.build(root.left, path[index:])
			elif root.left == path[index+1]:
				self.build(root.left, path[index:])
			elif root.right == None:
				root.right = self.build(root.right, path[index:])



		return root


	def printTree(self, root):
		if root == None:
			pass
		else:
			self.printTree(root.left)
			print root.name
			self.printTree(root.right)


def SplitPath(path):
	parts = []
	
	parts = path.split("/")

	while "" in parts:
		parts.remove("")

	return parts



tree = Tree()
root = None

root = tree.build(root, SplitPath("/home/sports/basketball/ncaa"))
root = tree.build(root, SplitPath("/home/music/rap/gangster"))

# depth-first search, left to right binary tree
tree.printTree(root)
